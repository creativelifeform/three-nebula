const { System, GPURenderer, SpriteRenderer } = window.Nebula;

const button = id => document.getElementById(id);
const { start, stop, add, remove } = {
  start: button('start'),
  stop: button('stop'),
  add: button('add'),
  remove: button('remove'),
};
const startSystem = system => {
  console.log(system);
};

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const systemRenderer = new GPURenderer(scene, THREE, {
    shouldDebugTextureAtlas: false,
  });
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: false,
  });

  start.addEventListener('click', () => startSystem(system));

  return system.addRenderer(systemRenderer);
};
