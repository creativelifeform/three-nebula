import {
  PARTICLE_CREATED,
  PARTICLE_DEAD,
  PARTICLE_UPDATE,
  SYSTEM_UPDATE,
} from '../events/constants';

import { RENDERER_TYPE_BASE } from './types';
import type System from '../core/System';
import type Particle from '../core/Particle';

export default class BaseRenderer {
  type: string;
  system: System | null;

  constructor(type: string = RENDERER_TYPE_BASE) {
    /**
     * @desc The class type.
     */
    this.type = type;
  }

  init(system: System): void {
    var self = this;

    this.system = system;

    this.system.eventDispatcher.addEventListener(SYSTEM_UPDATE, function(
      system
    ) {
      self.onSystemUpdate.call(self, system as System);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_CREATED, function(
      particle
    ) {
      self.onParticleCreated.call(self, particle as Particle);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_UPDATE, function(
      particle
    ) {
      self.onParticleUpdate.call(self, particle as Particle);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_DEAD, function(
      particle
    ) {
      self.onParticleDead.call(self, particle as Particle);
    });
  }

  remove(_system?: System): void {
    this.system = null;
  }

  /**
   * @abstract
   */
  onParticleCreated(particle: Particle): void {} // eslint-disable-line

  /**
   * @abstract
   */
  onParticleUpdate(particle: Particle): void {} // eslint-disable-line

  /**
   * @abstract
   */
  onParticleDead(particle: Particle): void {} // eslint-disable-line

  /**
   * @abstract
   */
  onSystemUpdate(system: System): void {} // eslint-disable-line

  /**
   * Tears down the renderer. Implemented by renderers that need cleanup
   * (e.g. the GPURenderer).
   *
   * @abstract
   */
  destroy?(): void;
}
