// Deterministic in-browser render harness for the VR golden master.
//
// Renders a website example's particle system under controlled conditions:
// seeded Math.random + fixed frame count. The examples call system.update()
// with three-nebula's fixed DEFAULT_SYSTEM_DELTA (not wall-clock dt), so they're
// already time-deterministic — the only nondeterminism is Math.random and how
// many frames elapse before capture. We pin both. Playwright waits for
// window.__vrDone, then screenshots #c.
import * as THREE from 'three';
import ParticleSystem, { GPURenderer } from 'three-nebula';
import seedrandom from 'seedrandom';
import { EXAMPLES } from './examples.js';

// MeshZone isn't in the page set and pulls an unresolved loader dep; exclude it.
const INIT = import.meta.glob([
  '../website/components/Examples/*/init.js',
  '!**/MeshZone/**',
]);
const DATA = import.meta.glob('../website/components/Examples/*/data.js');

const params = new URLSearchParams(location.search);
const name = params.get('example') || 'SpriteRendererGravity';
const seed = params.get('seed') || 'nebula';
const W = Number(params.get('w') || 800);
const H = Number(params.get('h') || 600);

const spec = EXAMPLES[name];
const frames = Number(params.get('frames') || spec?.frames || 120);

async function buildInit(scene, camera, renderer) {
  const loader = INIT[`../website/components/Examples/${name}/init.js`];
  if (!loader) throw new Error(`no init.js for "${name}"`);
  const init = (await loader()).default;
  return init(THREE, { scene, camera, renderer });
}

async function buildJson(scene) {
  const loader = DATA[`../website/components/Examples/${name}/data.js`];
  if (!loader) throw new Error(`no data.js for "${name}"`);
  const particleSystemState = (await loader()).default;
  const system = await ParticleSystem.fromJSONAsync(
    particleSystemState,
    THREE,
    { shouldAutoEmit: true }
  );
  system.addRenderer(new GPURenderer(scene, THREE));
  return system;
}

async function run() {
  // Seed the global RNG before anything builds or steps.
  seedrandom(seed, { global: true });

  // Drive example-internal requestAnimationFrame loops deterministically instead
  // of on wall-clock time. Some examples animate via rAF (PointZone orbits the
  // camera; EightDiagrams rotates its emitters to trace the pattern) — killing rAF
  // freezes them, but leaving it on real time makes the capture nondeterministic.
  // So we queue rAF callbacks and flush exactly one step per capture frame: same
  // frame count → same number of animation steps → deterministic and correct.
  const realRaf = window.requestAnimationFrame.bind(window);
  let rafQueue = [];
  window.requestAnimationFrame = cb => rafQueue.push(cb);
  window.cancelAnimationFrame = () => {};

  const canvas = document.getElementById('c');
  canvas.width = W;
  canvas.height = H;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000);
  camera.position.set(0, 0, 50);

  // Mirror the site's Base renderer lighting.
  scene.add(new THREE.AmbientLight(0x101010));
  const point = new THREE.PointLight(0xffffff, 2, 1000, 1);
  point.position.set(0, 200, 200);
  scene.add(point);
  const spot = new THREE.SpotLight(0xffffff, 0.5);
  spot.position.set(0, 500, 100);
  scene.add(spot);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true, // keep the last frame for the screenshot
  });
  renderer.setSize(W, H, false);

  // Track texture loads before building (loads start inside init/fromJSON), so we
  // can wait for them to finish before the synchronous frame loop — otherwise a
  // texture uploading mid-loop at a nondeterministic frame causes flake. Waiting
  // doesn't call update(), so it can't touch the RNG stream. Cap resolves the
  // no-texture case.
  const cap = Number(params.get('settle') || 2000);
  const texturesSettled = new Promise(resolve => {
    const mgr = THREE.DefaultLoadingManager;
    const prev = mgr.onLoad;
    mgr.onLoad = () => {
      prev && prev();
      resolve();
    };
    setTimeout(resolve, cap);
  });

  // LifeCycleApi drives a React component ref in its emit callbacks; stub it so
  // the standalone harness doesn't crash on setState.
  if (name === 'LifeCycleApi') {
    const refs = await import(
      '../website/components/Examples/LifeCycleApi/refs.js'
    );
    refs.feedbackRef.component = { setState: () => {} };
  }

  const kind = spec?.kind || 'init';
  const system =
    kind === 'json'
      ? await buildJson(scene)
      : await buildInit(scene, camera, renderer);

  await texturesSettled;

  for (let i = 0; i < frames; i++) {
    // Flush example rAF callbacks (one deterministic step per frame) before
    // stepping the system. They re-queue themselves for the next frame.
    const due = rafQueue;
    rafQueue = [];
    const t = i * 16.67;
    for (const cb of due) cb(t);

    system.update();
    renderer.render(scene, camera);
  }

  window.requestAnimationFrame = realRaf;
  window.__vrDone = true;
}

run().catch(e => {
  window.__vrError = String((e && e.stack) || e);
  console.error(e);
});
