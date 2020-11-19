const defaults = {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  maxTicks: Infinity,
};

async function run(init, options = {}) {
  const props = { ...defaults, ...options };
  const canvas = document.getElementById('canvas');

  window.visualisation = await new window.Visualization({
    canvas,
    init,
    ...props,
  });

  window.visualisation.start();
}
