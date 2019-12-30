import BaseRenderer from './Base';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export class JsonRenderer extends BaseRenderer {
  constructor(THREE, { canvas, json, shouldRotateCamera }) {
    super(THREE, { canvas, shouldRotateCamera });

    this.json = json;
  }

  async makeParticleSystem() {
    const { THREE } = this;
    const { default: ParticleSystem, SpriteRenderer } = await import(
      'three-nebula'
    );

    return new Promise(resolve => {
      ParticleSystem.fromJSONAsync(this.json.particleSystemState, THREE)
        .then(particleSystem => {
          this.particleSystem = particleSystem;
          particleSystem.addRenderer(new SpriteRenderer(this.scene, THREE));

          return resolve(this.render());
        })
        .catch(console.error);
    });
  }
}
