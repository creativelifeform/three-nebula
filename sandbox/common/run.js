async function run(init, { shouldRotateCamera = false } = {}) {
  const canvas = document.getElementById('canvas');
  const vis = await new window.Visualization({
    canvas,
    init,
    shouldRotateCamera: shouldRotateCamera || false,
  });

  vis.start();
}
