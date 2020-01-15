async function run(init) {
  const canvas = document.getElementById('canvas');
  const vis = await new window.Visualization({
    canvas,
    init,
  });

  vis.start();
}
