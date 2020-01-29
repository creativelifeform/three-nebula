const defaults = {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  maxTicks: Infinity,
};

async function run(init, options = {}) {
  const props = { ...defaults, ...options };
  const canvas = document.getElementById('canvas');
  const vis = await new window.Visualization({
    canvas,
    init,
    ...props,
  });

  vis.start();
}
