const { System, SpriteRenderer } = window.Nebula;

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new window.PointsRenderer(scene, { size: 1 });
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  return system.addRenderer(systemRenderer);
};
