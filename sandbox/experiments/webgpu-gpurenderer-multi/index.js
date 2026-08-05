// Level 1 multi-texture parity (spec 07): render the GpuRenderer example (5
// different textures) with the reference SpriteRenderer vs the real WebGPU
// batched renderer (three-nebula/webgpu) — both under three's WebGPURenderer.
//
//   ?renderer=sprite  (default) — reference: one THREE.Sprite per particle
//   ?renderer=webgpu            — three-nebula/webgpu GPURenderer (atlas, 1 draw)
import * as THREE from 'three/webgpu';
import ParticleSystem, { SpriteRenderer } from 'three-nebula';
import { GPURenderer } from 'three-nebula/webgpu';
import SYSTEM from '../../examples/GpuRenderer/data.js';

const mode =
  new URLSearchParams(location.search).get('renderer') === 'webgpu'
    ? 'webgpu'
    : 'sprite';

async function main() {
  const canvas = document.getElementById('canvas');
  const { clientWidth: w, clientHeight: h } = canvas;
  const renderer = new THREE.WebGPURenderer({ canvas, alpha: false, antialias: true });
  await renderer.init();
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, w / h, 1, 10000);
  camera.position.z = 50;

  const system = await ParticleSystem.fromJSONAsync(
    SYSTEM.particleSystemState ?? SYSTEM,
    THREE,
    { shouldAutoEmit: true }
  );
  system.addRenderer(
    mode === 'webgpu' ? new GPURenderer(scene, THREE) : new SpriteRenderer(scene, THREE)
  );

  window.__parity = { mode, particles: () => system.emitters.reduce((n, e) => n + e.particles.length, 0) };

  async function animate() {
    system.update();
    await renderer.renderAsync(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

main().catch(e => {
  window.__parityError = String((e && e.stack) || e);
  console.error(e);
});
