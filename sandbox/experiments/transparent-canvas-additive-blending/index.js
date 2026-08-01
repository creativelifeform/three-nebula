import * as THREE from 'three';
import System, { SpriteRenderer } from 'three-nebula';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { run } from '/common/run.js';
import { SYSTEM } from './data.js';

// Loads the famous Suzanne monkey and drops it in the scene so the particles
// composite over a real 3D object (as they would in an in-place designer).
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
  // Clear the WebGL canvas to TRANSPARENT (alpha 0) rather than the harness's
  // opaque black, so the CSS gradient behind the canvas shows through. The
  // renderer is already created with `{ alpha: true }` by the harness — this is
  // exactly an `alpha: true` host over a CSS-gradient background (#133).
  renderer.setClearColor(0x000000, 0);

  await loadSuzanne(scene);

  const { particleSystemState } = SYSTEM;
  const system = await System.fromJSONAsync(particleSystemState, THREE);

  return system.addRenderer(new SpriteRenderer(scene, THREE));
};

run(init, { shouldAddCameraControls: true });
