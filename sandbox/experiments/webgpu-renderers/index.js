// Level 0 audit for spec 07: do three-nebula's CPU-material renderers
// (SpriteRenderer / MeshRenderer) render under three's WebGPURenderer with no
// library changes? We reuse the existing example scenes verbatim and only swap
// the host renderer WebGLRenderer -> WebGPURenderer.
//
//   ?mode=sprite  (default) — SpriteRenderer (SpriteMaterial, unlit)
//   ?mode=mesh              — MeshRenderer (MeshLambertMaterial, lit)
import * as THREE from 'three/webgpu';

const mode =
  new URLSearchParams(location.search).get('mode') === 'mesh'
    ? 'mesh'
    : 'sprite';

// Diagnostics surfaced for the headed probe / console.
const diag = {
  mode,
  hasNavigatorGPU: typeof navigator !== 'undefined' && !!navigator.gpu,
  initialized: false,
  rendererType: null,
  backend: null,
  particles: 0,
  frames: 0,
  error: null,
};
window.__webgpu = diag;

async function main() {
  const canvas = document.getElementById('canvas');
  const { clientWidth: w, clientHeight: h } = canvas;

  const renderer = new THREE.WebGPURenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  await renderer.init(); // WebGPURenderer init is async
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);

  diag.initialized = true;
  diag.rendererType = renderer.constructor.name;
  diag.backend = renderer.backend?.constructor?.name ?? null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, w / h, 1, 10000);

  // Lit rig for the mesh materials (sprites are unlit — harmless there).
  const L = Math.PI;
  scene.add(new THREE.AmbientLight(0xffffff, 0.5 * L));
  const dir = new THREE.DirectionalLight(0xffffff, 1 * L);
  dir.position.set(1, 1, 1);
  scene.add(dir);

  // Reuse the existing example scenes unchanged — only THREE is three/webgpu.
  const mod =
    mode === 'mesh'
      ? await import('/examples/MeshRenderer/init.js')
      : await import('/examples/SpriteRendererGravity/init.js');
  const system = await mod.default(THREE, { scene, camera, renderer });
  diag.system = system;

  // Real-time playback via tick(realDelta) so speed is refresh-rate independent.
  let last = performance.now();
  async function animate() {
    try {
      const now = performance.now();

      system.tick((now - last) / 1000);
      last = now;
      diag.particles = system.emitters.reduce(
        (n, e) => n + e.particles.length,
        0
      );
      await renderer.renderAsync(scene, camera);
      diag.frames++;
      requestAnimationFrame(animate);
    } catch (e) {
      diag.error = String((e && e.stack) || e);
      console.error(e);
    }
  }

  animate();
}

main().catch(e => {
  diag.error = String((e && e.stack) || e);
  console.error(e);
});
