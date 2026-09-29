import * as THREE from 'three';
import System, {
  Alpha,
  Body,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  Radius,
  Rate,
  Scale,
  Span,
  VectorVelocity,
  Vector3D,
  DiscZone,
  GPURenderer,
  Vortex,
} from 'three-nebula';
import { glow } from '/common/sprite.js';
import { run } from '/common/run.js';

// Field Portal — a demo of the "shared field" idea: ONE vortex vector field drives
// BOTH a ground-ring shader AND three-nebula particles.
//
//   • The field is the swirl + inward-pull of a Vortex around +Y (the same maths
//     the library `Vortex` behaviour computes).
//   • SHADER: we bake that field into a flow-map texture; a ground-ring material
//     advects a noise texture along it → swirling flame arms (Eulerian).
//   • PARTICLES: the library `Vortex` behaviour moves rising motes along the same
//     field (Lagrangian).
//
// Same field, two representations — so the texture swirl and the particle swirl
// agree by construction. (Productionised, the field would be a first-class `Field`
// object shared by both; here the formula is matched by hand.)

const CENTER = new Vector3D(0, 0, 0);
const UP = new Vector3D(0, 1, 0);
const PORTAL_RADIUS = 175;

// --- The shared field: horizontal flow direction of a +Y vortex at plane (x,z).
// tangential = axis × radial = (z, -x); inward = (-x, -z). Matches library Vortex.
const SWIRL = 1.0;
const PULL = 0.35;
const vortexFlowDir = (x, z) => {
  const dist = Math.hypot(x, z) || 1e-4;
  const fx = (SWIRL * z + PULL * -x) / dist;
  const fz = (SWIRL * -x + PULL * -z) / dist;
  const m = Math.hypot(fx, fz) || 1e-4;

  return [fx / m, fz / m];
};

// Bake the field into a flow-map (RG = direction encoded to 0..1) for the shader.
const bakeFlowMap = (size = 128) => {
  const data = new Uint8Array(size * size * 4);

  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = (i + 0.5) / size - 0.5;
      const z = (j + 0.5) / size - 0.5;
      const [fx, fz] = vortexFlowDir(x, z);
      const o = (j * size + i) * 4;

      data[o] = Math.round((fx * 0.5 + 0.5) * 255);
      data[o + 1] = Math.round((fz * 0.5 + 0.5) * 255);
      data[o + 2] = 0;
      data[o + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;

  return tex;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float time;
  uniform sampler2D flowMap;
  uniform vec3 colorInner;
  uniform vec3 colorOuter;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int k = 0; k < 4; k++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    float r = length(uv - 0.5) * 2.0;              // 0 centre .. 1 edge

    // Flow direction from the baked vortex field.
    vec2 flow = texture2D(flowMap, uv).rg * 2.0 - 1.0;

    // Dual-phase flow-map advection (avoids infinite stretching).
    float sp = 0.35;
    float ph0 = fract(time * sp);
    float ph1 = fract(time * sp + 0.5);
    vec2 base = uv * 5.0;
    float n0 = fbm(base - flow * ph0 * 1.4);
    float n1 = fbm(base - flow * ph1 * 1.4);
    float n = mix(n0, n1, abs(ph0 - 0.5) * 2.0);

    // Ring mask: a flame band between two radii, soft-edged.
    float ring = smoothstep(0.30, 0.46, r) * (1.0 - smoothstep(0.82, 0.98, r));

    float flame = ring * pow(n, 1.6) * 2.4;
    vec3 col = mix(colorOuter, colorInner, n) * flame;
    col += colorInner * ring * smoothstep(0.55, 0.85, n); // hot inner rim

    gl_FragColor = vec4(col, 1.0);                 // AdditiveBlending → alpha unused
  }
`;

const createPortalMesh = () => {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      flowMap: { value: bakeFlowMap() },
      colorInner: { value: new THREE.Color('#c8ffd6') },
      colorOuter: { value: new THREE.Color('#18ff5a') },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(PORTAL_RADIUS * 2, PORTAL_RADIUS * 2),
    material
  );

  mesh.rotation.x = -Math.PI / 2; // lay flat on the ground (XZ plane)
  mesh.position.y = 0.5;

  // Advance the shader clock once per render — deterministic in capture mode (one
  // render per fixed step), smooth in realtime.
  mesh.onBeforeRender = () => {
    material.uniforms.time.value += 1 / 60;
  };

  return mesh;
};

// Rising motes, swept by the SAME vortex field (library Vortex behaviour).
const createMotes = (colorA, colorB, rate) =>
  new Emitter()
    .setRate(new Rate(new Span(rate, rate + 4), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(2, 3.2),
      new Body(glow(0xffffff)),
      new Radius(3, 7),
      new Position(new DiscZone(0, 0, 0, PORTAL_RADIUS * 0.6)),
      new VectorVelocity(new Vector3D(0, 130, 0), 10), // rise out of the portal
    ])
    .setBehaviours([
      // Moderate swirl + strong inward pull → funnel up (not fling out flat).
      new Vortex(CENTER, UP, 380, 220), // swirl + inward pull — the shared field
      new Color(colorA, colorB),
      new Alpha(0.9, 0),
      new Scale(1, 0.35),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(60606);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshBasicMaterial({ color: 0x0a120c })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  scene.add(createPortalMesh());

  camera.position.set(0, 175, 380);
  camera.lookAt(0, 10, 0);

  return system
    .addEmitter(createMotes('#c8ffd6', '#18ff5a', 16)) // green motes
    .addEmitter(createMotes('#ffcc6a', '#ff5a1a', 4)) // orange ember accents
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 24000 }));
};

run(init, {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  cameraTarget: [0, 10, 0],
});
