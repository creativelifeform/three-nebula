const {
  Nebula: { System, GPURenderer, SpriteRenderer },
  SYSTEM: { particleSystemState },
  EMITTERS,
} = window;

let visualisation, system, systemRenderer, container;
const button = id => document.getElementById(id);
const { restart, stop, add, remove } = {
  restart: button('restart'),
  add: button('add'),
  remove: button('remove'),
};

/**
 * Creates a brand new system from the current particleSystemState object.
 *
 * @return {Promise<System>}
 */
const createSystem = () => {
  const { emitters } = particleSystemState;

  if (!emitters.length) {
    particleSystemState.emitters.unshift(EMITTERS.shift());
  }

  return System.fromJSONAsync(particleSystemState, THREE);
};

/**
 * If the EMITTERS store has any emitters left, this adds the first emitter to the
 * end of the particleSystemState object's emitters.
 *
 * The system is fully restarted afterwards.
 */
const addEmitter = system => {
  if (EMITTERS.length) {
    particleSystemState.emitters.push(EMITTERS.shift());
  }

  restartSystem(system);
};

/**
 * If the particle system state has more than one emitter, this will pop the last one
 * off and place it back into the EMITTERS store to be added again later.
 *
 * The system is fully restarted afterwards.
 */
const removeEmitter = system => {
  console.log(particleSystemState.emitters);
  if (particleSystemState.emitters.length <= 1) {
    return;
  }

  EMITTERS.unshift(particleSystemState.emitters.pop());

  restartSystem(system);
};

/**
 * Gets the correct renderer for the system.
 *
 * @param {Scene} container
 */
const createRenderer = container =>
  new GPURenderer(container, THREE, { shouldDebugTextureAtlas: true });

/**
 * Fully restarts the particle system by destroying it first.
 *
 * @param {System} system
 */
const restartSystem = system => {
  visualisation.stop();

  createSystem().then(hydrated => {
    system = hydrated;

    system.addRenderer(createRenderer(container));

    visualisation.restart(system);
  });
};

/**
 * Boots the visualisation.
 *
 */
window.init = async ({ scene, camera, renderer }) => {
  container = scene;
  systemRenderer = createRenderer(container);
  system = await createSystem();
  visualisation = window.visualisation;

  restart.addEventListener('click', () => restartSystem(system));
  add.addEventListener('click', () => addEmitter(system));
  remove.addEventListener('click', () => removeEmitter(system));

  return system.addRenderer(systemRenderer);
};
