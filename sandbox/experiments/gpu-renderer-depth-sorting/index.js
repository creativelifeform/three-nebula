const { System, SpriteRenderer, GPURenderer } = window.Nebula;

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const meshSize = 10;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(meshSize, meshSize, meshSize),
    new THREE.MeshPhongMaterial({ wireframe: false, color: 'red' })
  );
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const gpuRenderer = new GPURenderer(scene, renderer, THREE);
  const systemRenderer = gpuRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  scene.add(new THREE.AmbientLight(0xffffff));
  scene.add(mesh);

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
