import * as THREE from 'three';
import System, { SpriteRenderer } from 'three-nebula';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { run } from '/common/run.js';
// Opaque circle_01.png, additive. The GPU variant of this experiment imports
// this same system, so the two renderers can be compared directly.
import { SYSTEM } from './data.js';

// Draw the gradient to a canvas and use it as the scene background. The gradient
// now lives IN the WebGL framebuffer, so additive particles blend against real
// pixels (true additive) instead of trying to composite over a transparent DOM
// canvas — no alpha channel needed, no shader hacks.
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
  // The gradient is a scene object on an opaque canvas — no transparent CSS
  // canvas, so the additive-over-DOM problem simply doesn't exist.
  scene.background = makeGradientBackground();

  await loadSuzanne(scene);

  const system = await System.fromJSONAsync(SYSTEM.particleSystemState, THREE);

  return system.addRenderer(new SpriteRenderer(scene, THREE));
};

run(init, { shouldAddCameraControls: true });
