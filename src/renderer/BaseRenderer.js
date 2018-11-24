import {
  PARTICLE_CREATED,
  PARTICLE_DEAD,
  PARTICLE_UPDATE,
  PROTON_UPDATE
} from '../events/constants';

import { classDeprecationWarning } from '../compatibility';

export default class BaseRenderer {
  constructor() {
    this.name = 'BaseRender';
  }

  init(proton) {
    var self = this;

    this.proton = proton;

    this.proton.eventDispatcher.addEventListener(PROTON_UPDATE, function(
      proton
    ) {
      self.onProtonUpdate.call(self, proton);
    });

    this.proton.eventDispatcher.addEventListener(PARTICLE_CREATED, function(
      particle
    ) {
      self.onParticleCreated.call(self, particle);
    });

    this.proton.eventDispatcher.addEventListener(PARTICLE_UPDATE, function(
      particle
    ) {
      self.onParticleUpdate.call(self, particle);
    });

    this.proton.eventDispatcher.addEventListener(PARTICLE_DEAD, function(
      particle
    ) {
      self.onParticleDead.call(self, particle);
    });
  }

  remove() {
    this.proton = null;
  }

  /**
   * @abstract
   */
  onParticleCreated(particle) {} // eslint-disable-line

  /**
   * @abstract
   */
  onParticleUpdate(particle) {} // eslint-disable-line

  /**
   * @abstract
   */
  onParticleDead(particle) {} // eslint-disable-line

  /**
   * @abstract
   */
  onProtonUpdate(proton) {} // eslint-disable-line
}

export class BaseRender extends BaseRenderer {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('BaseRender', 'BaseRenderer'));
  }
}
