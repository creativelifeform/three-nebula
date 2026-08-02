import * as THREE from 'three';
import System, { GPURenderer } from 'three-nebula';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { run } from '/common/run.js';
// Reuse the CPU experiment's system verbatim — only the renderer differs.
import { SYSTEM } from '../additive-blending-scene-background-cpu/data.js';

// Draw the gradient to a canvas and use it as the scene background so additive
// particles blend against real framebuffer pixels (true additive) on an opaque
// canvas — no transparent-canvas compositing, no alpha channel needed.
const makeGradientBackground = () => {
  const canvas = document.createElement('canvas');

  canvas.width = 4;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);

  gradient.addColorStop(0, '#f6d365');
  gradient.addColorStop(0.45, '#fda085');
  gradient.addColorStop(1, '#a18cd1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

const loadSuzanne = scene =>
  new Promise((resolve, reject) => {
    new GLTFLoader().load(
      '/assets/suzanne/Suzanne.gltf',
      gltf => {
        const suzanne = gltf.scene;

        suzanne.scale.setScalar(12);
        suzanne.position.set(0, 0, 0);
        suzanne.rotation.y = -0.5;
        scene.add(suzanne);
        resolve(suzanne);
      },
      undefined,
      reject
    );
  });

const init = async ({ scene, camera, renderer }) => {
  scene.background = makeGradientBackground();

  await loadSuzanne(scene);

  const system = await System.fromJSONAsync(SYSTEM.particleSystemState, THREE);

  return system.addRenderer(new GPURenderer(scene, THREE));
};

run(init, { shouldAddCameraControls: true });
