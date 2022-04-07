const { System, SpriteRenderer, GPURenderer } = window.Nebula;

const button = id => document.getElementById(id);
const { start, stop } = {
  start: button('start'),
  stop: button('stop'),
};

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new GPURenderer(scene, renderer, THREE);
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, { shouldAutoEmit: false });

  start.addEventListener('click', () => {
    system.emitters[0].emit();
  });

  stop.addEventListener('click', () => {
    system.emitters[0].stopEmit();
  });

  if(systemRenderer.type === 'GPURenderer' || systemRenderer.type === 'MobileGPURenderer' || systemRenderer.type === 'DesktopGPURenderer')
  {
    window.onresize = (e) => {
      setTimeout(() => {
        system.setSize(renderer.domElement.width,renderer.domElement.height);
      },100)
    }
  }

  return system.addRenderer(systemRenderer);
};
