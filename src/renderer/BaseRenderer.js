import {
  PARTICLE_CREATED,
  PARTICLE_DEAD,
  PARTICLE_UPDATE,
  PROTON_UPDATE
} from '../events/constants';

import { RENDERER_TYPE_BASE } from './types';

export default class BaseRenderer {
  constructor(type = RENDERER_TYPE_BASE) {
    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
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
