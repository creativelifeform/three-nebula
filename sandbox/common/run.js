import { Visualization } from '/common/Visualization.js';

const defaults = {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  maxTicks: Infinity,
};

// Boots an experiment: `init` receives { scene, camera, renderer } and returns
// the particle system to drive. Kept on window so experiments (and the console)
// can reach the running visualisation.
export async function run(init, options = {}) {
  const props = { ...defaults, ...options };
  const canvas = document.getElementById('canvas');

  window.visualisation = new Visualization({ canvas, init, ...props });

  return window.visualisation.start();
}
