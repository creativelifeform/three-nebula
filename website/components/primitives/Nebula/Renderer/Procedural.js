import BaseRenderer from './Base';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export class ProceduralRenderer extends BaseRenderer {
  constructor(THREE, { canvas, init, shouldRotateCamera = false }) {
    super(THREE, { canvas, shouldRotateCamera });

    this.init = init;
  }

  async makeParticleSystem() {
    const { THREE } = this;
    const { scene, camera, webGlRenderer } = this;

    this.particleSystem = await this.init(THREE, {
      scene,
      camera,
      renderer: webGlRenderer,
    });

    return Promise.resolve(this.render());
  }
}
