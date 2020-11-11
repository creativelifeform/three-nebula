const { System, GPURenderer, SpriteRenderer } = window.Nebula;

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const systemRenderer = new GPURenderer(scene, THREE, {
    shouldDebugTextureAtlas: true,
  });
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  return system.addRenderer(systemRenderer);
};
