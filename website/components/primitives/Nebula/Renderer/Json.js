import * as THREE from 'three';

import ParticleSystem, { SpriteRenderer } from 'three-nebula';

import BaseRenderer from './Base';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export class Renderer extends BaseRenderer {
  constructor({ canvas, json, shouldRotateCamera }) {
    super({ canvas, shouldRotateCamera });

    this.json = json;
  }

  async makeParticleSystem() {
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
