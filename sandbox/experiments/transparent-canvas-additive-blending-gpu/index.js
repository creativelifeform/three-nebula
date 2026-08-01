import * as THREE from 'three';
import System, { GPURenderer } from 'three-nebula';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { run } from '/common/run.js';
// Reuse the SpriteRenderer experiment's particle system verbatim so the only
// difference between the two experiments is the renderer.
import { SYSTEM } from '../transparent-canvas-additive-blending/data.js';

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
  // Clear the WebGL canvas transparent so the CSS gradient shows through — an
  // `alpha: true` host over a CSS-gradient background (#133).
  renderer.setClearColor(0x000000, 0);

  await loadSuzanne(scene);

  const { particleSystemState } = SYSTEM;
  const system = await System.fromJSONAsync(particleSystemState, THREE);

  return system.addRenderer(new GPURenderer(scene, THREE));
};

run(init, { shouldAddCameraControls: true });
