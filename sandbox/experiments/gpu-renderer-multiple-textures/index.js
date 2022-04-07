const { System, GPURenderer, SpriteRenderer } = window.Nebula;

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const systemRenderer = new GPURenderer(scene, renderer, THREE, {
    shouldDebugTextureAtlas: true,
  });
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
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
