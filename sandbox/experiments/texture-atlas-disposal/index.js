const {
  Nebula: { System, GPURenderer, SpriteRenderer },
  SYSTEM: { particleSystemState },
} = window;

let visualisation, system, systemRenderer, container;
const button = id => document.getElementById(id);
const { restart, stop, add, remove } = {
  restart: button('restart'),
  stop: button('stop'),
  add: button('add'),
  remove: button('remove'),
};

const hydrateSystem = () => System.fromJSONAsync(particleSystemState, THREE);
const getRenderer = container =>
  new GPURenderer(container, THREE, { shouldDebugTextureAtlas: true });
const restartSystem = system => {
  visualisation.stop();

  hydrateSystem().then(hydrated => {
    system = hydrated;

    system.addRenderer(getRenderer(container));

    console.log(system);
    visualisation.restart(system);
  });
};

window.init = async ({ scene, camera, renderer }) => {
  container = scene;
  systemRenderer = getRenderer(container);
  system = await hydrateSystem();
  visualisation = window.visualisation;

  console.log('FIRST SYSTEM', system);

  restart.addEventListener('click', () => restartSystem(system));

  return system.addRenderer(systemRenderer);
};
