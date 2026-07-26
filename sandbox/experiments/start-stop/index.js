import * as THREE from 'three';
import System, { SpriteRenderer, GPURenderer } from 'three-nebula';
import { run } from '/common/run.js';
import { SYSTEM } from './data.js';

const button = id => document.getElementById(id);
const { start, stop } = {
  start: button('start'),
  stop: button('stop'),
};

const init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = SYSTEM;
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new GPURenderer(scene, THREE);
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: false,
  });

  start.addEventListener('click', () => {
    system.emitters[0].emit();
  });

  stop.addEventListener('click', () => {
    system.emitters[0].stopEmit();
  });

  return system.addRenderer(systemRenderer);
};

run(init);
