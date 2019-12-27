import BaseRenderer from './Base';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export class Renderer extends BaseRenderer {
  constructor({ canvas, init, shouldRotateCamera = false }) {
    super({ canvas, shouldRotateCamera });

    this.init = init;
  }

  async makeParticleSystem() {
    const { scene, camera, webGlRenderer } = this;

    this.particleSystem = await this.init({
      scene,
      camera,
      renderer: webGlRenderer,
    });

    return Promise.resolve(this.render());
  }
}
