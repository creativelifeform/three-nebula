import { Euler } from '../core/three/';
import type Initializer from './Initializer';
import type Emitter from '../emitter/Emitter';
import type Particle from '../core/Particle';

const particleEuler = new Euler();

export default {
  particleEuler: null,
  /**
   * Loops through the initializers array and calls each initializer's initialize method
   * on the supplied particle. This sets the particle's initial properties.
   *
   * @see {@link '../emitter/Emitter'} setupParticle
   * @param emitter - The emitter that has called this method
   * @param particle - The particle that has just been created
   * @param initializers - All of the emitter's initializers
   */
  initialize: function (
    emitter: Emitter,
    particle: Particle,
    initializers: Initializer[]
  ): void {
    let i = initializers.length;

    while (i--) {
      initializers[i].init(emitter, particle);
    }

    emitter.bindEmitter && this.bindEmitter(emitter, particle);
  },

  /**
   * Ensures that the emitter's position, velocity and accleration are added
   * to each created particle.
   *
   * @param emitter - The emitter that is emitting the particles
   * @param particle - The newly created particle
   */
  bindEmitter: function (emitter: Emitter, particle: Particle): void {
    const {
      rotation: { x, y, z },
    } = emitter;

    particle.position.add(emitter.position);
    particle.velocity.add(emitter.velocity);
    particle.acceleration.add(emitter.acceleration);
    particle.velocity.applyEuler(particleEuler.set(x, y, z));
  },
};
