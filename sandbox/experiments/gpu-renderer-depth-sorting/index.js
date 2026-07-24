import * as THREE from 'three';
import System, { SpriteRenderer, GPURenderer } from 'three-nebula';
import { run } from '/common/run.js';
import { SYSTEM } from './data.js';

const init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = SYSTEM;
  const meshSize = 10;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(meshSize, meshSize, meshSize),
    new THREE.MeshPhongMaterial({ wireframe: false, color: 'red' })
  );
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const gpuRenderer = new GPURenderer(scene, THREE, { camera });
  const systemRenderer = gpuRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  scene.add(new THREE.AmbientLight(0xffffff));
  scene.add(mesh);

  return system.addRenderer(systemRenderer);
};

run(init);
