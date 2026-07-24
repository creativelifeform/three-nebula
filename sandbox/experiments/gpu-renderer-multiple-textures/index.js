import * as THREE from 'three';
import System, { GPURenderer, SpriteRenderer } from 'three-nebula';
import { run } from '/common/run.js';
import { SYSTEM } from './data.js';

const init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = SYSTEM;
  const systemRenderer = new GPURenderer(scene, THREE, {
    shouldDebugTextureAtlas: true,
  });
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  return system.addRenderer(systemRenderer);
};

run(init);
