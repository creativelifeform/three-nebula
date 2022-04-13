import BaseRenderer from './Base';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export class JsonRenderer extends BaseRenderer {
  constructor(
    THREE,
    {
      canvas,
      json,
      shouldRotateCamera,
      shouldExposeLifeCycleApi,
      onStart,
      onUpdate,
      onEnd,
      webGlRendererOptions,
    }
  ) {
    super(THREE, { canvas, shouldRotateCamera, webGlRendererOptions });

    this.shouldExposeLifeCycleApi = shouldExposeLifeCycleApi;
    this.onStart = onStart;
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.json = json;
  }

  async makeParticleSystem() {
    const { THREE, shouldExposeLifeCycleApi, onStart, onUpdate, onEnd } = this;
    const { default: ParticleSystem, GPURenderer } = await import(
      'three-nebula'
    );
    let shouldAutoEmit = true;

    if (shouldExposeLifeCycleApi) {
      shouldAutoEmit = false;
    }

    return new Promise(resolve => {
      ParticleSystem.fromJSONAsync(this.json.particleSystemState, THREE, {
        shouldAutoEmit,
      })
        .then(particleSystem => {
          this.particleSystem = particleSystem;

          particleSystem.addRenderer(
            new GPURenderer(this.scene, this.webGlRenderer, THREE)
          );

          if (shouldExposeLifeCycleApi) {
            particleSystem.emit({
              onStart,
              onUpdate,
              onEnd,
            });
          }

          return resolve(this.render());
        })
        .catch(console.error);
    });
  }
}
