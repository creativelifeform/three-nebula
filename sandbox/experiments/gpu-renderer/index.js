const { System, SpriteRenderer, GPURenderer } = window.Nebula;

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new GPURenderer(scene, THREE);
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE);

  return system.addRenderer(systemRenderer);
};
