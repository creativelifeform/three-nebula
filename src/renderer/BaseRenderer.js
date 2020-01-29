import {
  PARTICLE_CREATED,
  PARTICLE_DEAD,
  PARTICLE_UPDATE,
  SYSTEM_UPDATE,
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

  init(system) {
    var self = this;

    this.system = system;

    this.system.eventDispatcher.addEventListener(SYSTEM_UPDATE, function(
      system
    ) {
      self.onSystemUpdate.call(self, system);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_CREATED, function(
      particle
    ) {
      self.onParticleCreated.call(self, particle);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_UPDATE, function(
      particle
    ) {
      self.onParticleUpdate.call(self, particle);
    });

    this.system.eventDispatcher.addEventListener(PARTICLE_DEAD, function(
      particle
    ) {
      self.onParticleDead.call(self, particle);
    });

    this.logRendererType();
  }

  remove() {
    this.system = null;
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
  onSystemUpdate(system) {} // eslint-disable-line

  /**
   * Logs the renderer type being used when in development mode.
   *
   * @return void
   */
  logRendererType() {
    if (!process) {
      return;
    }

    if (!process.env) {
      return;
    }

    if (!process.env.NODE_ENV) {
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log(`${this.type}`);
  }
}
