import { Euler } from '../core/three/';

const particleEuler = new Euler();

export default {
  particleEuler: null,
  /**
   * Loops through the initializers array and calls each initializer's initialize method
   * on the supplied particle. This sets the particle's initial properties.
   *
   * @see {@link '../emitter/Emitter'} setupParticle
   * @param {Emitter} emitter - The emitter that has called this method
   * @param {Particle} particle - The particle that has just been created
   * @param {array<Initializer>} initializers - All of the emitter's initializers
   * @return void
   */
  initialize: function(emitter, particle, initializers) {
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
   * @param {Emitter} emitter - The emitter that is emitting the particles
   * @param {Particle} particle - The newly created particle
   * @return void
   */
  bindEmitter: function(emitter, particle) {
    const {
      rotation: { x, y, z },
    } = emitter;

    particle.position.add(emitter.position);
    particle.velocity.add(emitter.velocity);
    particle.acceleration.add(emitter.acceleration);
    particle.velocity.applyEuler(particleEuler.set(x, y, z));
  },
};
