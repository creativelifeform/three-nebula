// Level 1 parity harness (spec 07): render the SAME particle system with the
// reference SpriteRenderer vs a prototype WebGPU batched renderer, both under
// three's WebGPURenderer, so we can cross-check the new renderer against a known
// -good golden reference.
//
//   ?renderer=sprite  (default) — reference: one THREE.Sprite per particle
//   ?renderer=webgpu            — prototype: instanced quads via SpriteNodeMaterial
import * as THREE from 'three/webgpu';
import { attribute, texture, uv } from 'three/tsl';
import ParticleSystem, {
  Body,
  Color,
  Emitter,
  Gravity,
  Life,
  Mass,
  Position,
  RadialVelocity,
  RandomDrift,
  Rate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  ease,
} from 'three-nebula';
import dot from '../../assets/dot.png';

const mode =
  new URLSearchParams(location.search).get('renderer') === 'webgpu'
    ? 'webgpu'
    : 'sprite';

// --- prototype WebGPU batched renderer -------------------------------------
// Reimplements the GLSL GPURenderer's lifecycle (particle -> instance slot ->
// per-instance attributes) with instanced quads + a node material. Single
// texture for now (atlas/rotation/multi-texture come next).
class WebGPUGPURenderer {
  constructor(scene, three, { maxParticles = 5000 } = {}) {
    this.scene = scene;
    this.THREE = three;
    this.max = maxParticles;
    this.freeSlots = [];
    for (let i = maxParticles - 1; i >= 0; i--) this.freeSlots.push(i);
    this.idToIndex = new Map();
    this.highWater = 0;
    this.dirty = false;
    this.textureBound = false;

    this.aOffset = new three.InstancedBufferAttribute(
      new Float32Array(maxParticles * 3),
      3
    );
    this.aColor = new three.InstancedBufferAttribute(
      new Float32Array(maxParticles * 3),
      3
    );
    this.aAlpha = new three.InstancedBufferAttribute(
      new Float32Array(maxParticles),
      1
    );
    this.aScale = new three.InstancedBufferAttribute(
      new Float32Array(maxParticles),
      1
    );
    this.aRotation = new three.InstancedBufferAttribute(
      new Float32Array(maxParticles),
      1
    );

    const base = new three.PlaneGeometry(1, 1);
    const geo = new three.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    geo.setAttribute('aOffset', this.aOffset);
    geo.setAttribute('aColor', this.aColor);
    geo.setAttribute('aAlpha', this.aAlpha);
    geo.setAttribute('aScale', this.aScale);
    geo.setAttribute('aRotation', this.aRotation);
    geo.instanceCount = 0;
    this.geometry = geo;

    const mat = new three.SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: three.AdditiveBlending,
    });
    mat.positionNode = attribute('aOffset');
    mat.scaleNode = attribute('aScale');
    mat.rotationNode = attribute('aRotation');
    mat.opacityNode = attribute('aAlpha');
    this.material = mat;

    this.mesh = new three.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  init(system) {
    const self = this;
    const on = (evt, fn) => system.eventDispatcher.addEventListener(evt, fn);
    on('SYSTEM_UPDATE', () => self.onSystemUpdate());
    on('PARTICLE_CREATED', p => self.onParticleCreated(p));
    on('PARTICLE_UPDATE', p => self.onParticleUpdate(p));
    on('PARTICLE_DEAD', p => self.onParticleDead(p));
  }

  slot(p) {
    let i = this.idToIndex.get(p.id);
    if (i === undefined) {
      i = this.freeSlots.pop();
      this.idToIndex.set(p.id, i);
      this.highWater = Math.max(this.highWater, i + 1);
      this.geometry.instanceCount = this.highWater;
    }
    return i;
  }

  bindTexture(p) {
    if (this.textureBound || !(p.body instanceof this.THREE.Sprite)) return;
    const map = p.body.material.map;
    if (!map) return;
    this.material.colorNode = texture(map, uv()).mul(attribute('aColor'));
    this.material.needsUpdate = true;
    this.textureBound = true;
  }

  write(p) {
    const i = this.slot(p);
    this.aOffset.array[i * 3 + 0] = p.position.x;
    this.aOffset.array[i * 3 + 1] = p.position.y;
    this.aOffset.array[i * 3 + 2] = p.position.z;
    this.aColor.array[i * 3 + 0] = p.color.r;
    this.aColor.array[i * 3 + 1] = p.color.g;
    this.aColor.array[i * 3 + 2] = p.color.b;
    this.aAlpha.array[i] = p.alpha;
    this.aScale.array[i] = p.scale * p.radius;
    this.aRotation.array[i] = p.rotation.z;
    this.dirty = true;
  }

  onParticleCreated(p) {
    this.bindTexture(p);
    this.write(p);
  }

  onParticleUpdate(p) {
    this.write(p);
  }

  onParticleDead(p) {
    const i = this.idToIndex.get(p.id);
    if (i === undefined) return;
    this.aScale.array[i] = 0;
    this.idToIndex.delete(p.id);
    this.freeSlots.push(i);
    this.dirty = true;
  }

  onSystemUpdate() {
    if (!this.dirty) return;
    for (const a of [
      this.aOffset,
      this.aColor,
      this.aAlpha,
      this.aScale,
      this.aRotation,
    ])
      a.needsUpdate = true;
    this.dirty = false;
  }
}

// --- the golden particle system (same as SpriteRendererGravity) ------------
const createSprite = () => {
  const map = new THREE.TextureLoader().load(dot);
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      color: 0xff0000,
      blending: THREE.AdditiveBlending,
      fog: true,
    })
  );
};

const createEmitter = () =>
  new Emitter()
    .setRate(new Rate(new Span(10, 15), new Span(0.05, 0.1)))
    .addInitializers([
      new Body(createSprite()),
      new Mass(1),
      new Life(1, 3),
      new Position(new SphereZone(20)),
      new RadialVelocity(new Span(500, 800), new Vector3D(0, 1, 0), 30),
    ])
    .addBehaviours([
      new RandomDrift(10, 10, 10, 0.05),
      new Scale(new Span(2, 3.5), 0),
      new Gravity(6),
      new Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, ease.easeOutSine),
    ])
    .setPosition({ x: 0, y: -150 })
    .emit();

async function main() {
  const canvas = document.getElementById('canvas');
  const { clientWidth: w, clientHeight: h } = canvas;
  const renderer = new THREE.WebGPURenderer({
    canvas,
    alpha: false,
    antialias: true,
  });
  await renderer.init();
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, w / h, 1, 10000);
  camera.position.z = 500;

  const system = new ParticleSystem();
  system.addEmitter(createEmitter());
  system.addRenderer(
    mode === 'webgpu'
      ? new WebGPUGPURenderer(scene, THREE)
      : new SpriteRenderer(scene, THREE)
  );

  window.__parity = {
    mode,
    particles: () =>
      system.emitters.reduce((n, e) => n + e.particles.length, 0),
  };

  // Real-time playback via tick(realDelta) so speed is refresh-rate independent.
  let last = performance.now();
  async function animate() {
    const now = performance.now();
    system.tick((now - last) / 1000);
    last = now;
    await renderer.renderAsync(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

main().catch(e => {
  window.__parityError = String((e && e.stack) || e);
  console.error(e);
});
