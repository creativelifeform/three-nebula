// Level 1 spike (spec 07): prove the instanced-quad TSL approach for the batched
// particle renderer under three's WebGPURenderer — the replacement for the GLSL
// gl.POINTS GPURenderer. N camera-facing textured quads, per-instance colour,
// additive. If this renders correctly the full GPURenderer rebuild is de-risked.
import * as THREE from 'three/webgpu';
import { texture, uv, attribute } from 'three/tsl';

const N = 600;
const diag = { rendered: false, backend: null, error: null };
window.__spike = diag;

async function main() {
  const canvas = document.getElementById('canvas');
  const { clientWidth: w, clientHeight: h } = canvas;

  const renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
  await renderer.init();
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);
  diag.backend = renderer.backend?.constructor?.name ?? null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
  camera.position.z = 60;

  const tex = await new THREE.TextureLoader().loadAsync('/assets/dot.png');

  // Per-instance data in instanced attributes; SpriteNodeMaterial billboards
  // each quad at positionNode (= the instance offset) with scaleNode / colour.
  const off = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const scl = new Float32Array(N);
  const color = new THREE.Color();
  for (let i = 0; i < N; i++) {
    off[i * 3 + 0] = (Math.random() - 0.5) * 70;
    off[i * 3 + 1] = (Math.random() - 0.5) * 45;
    off[i * 3 + 2] = (Math.random() - 0.5) * 25;
    color.setHSL(Math.random(), 0.9, 0.6);
    col[i * 3 + 0] = color.r;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;
    scl[i] = 2 + Math.random() * 5;
  }

  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.attributes.position);
  geo.setAttribute('uv', base.attributes.uv);
  geo.instanceCount = N;
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(col, 3));
  geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scl, 1));

  const mat = new THREE.SpriteNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  mat.positionNode = attribute('aOffset'); // billboard centre per instance
  mat.scaleNode = attribute('aScale');
  mat.colorNode = texture(tex, uv()).mul(attribute('aColor'));

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  await renderer.renderAsync(scene, camera);
  diag.rendered = true;
}

main().catch(e => {
  diag.error = String((e && e.stack) || e);
  console.error(e);
});
