import { Euler } from 'three';
import Initializer from './Initializer';
import Util from '../utils/Util';

const particleEuler = new Euler();

export default {
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
    var i = initializers.length;

    while (i--) {
      var initializer = initializers[i];

      // TODO remove this conditional, the else is not entered in any of the examples
      // and is just confusing
      /* istanbul ignore else */
      if (initializer instanceof Initializer)
        initializer.init(emitter, particle);
      else this.init(emitter, particle, initializer);
    }

    this.bindEmitter(emitter, particle);
  },

  /**
   * @deprecated Looks like this method is never called
   */
  init: function(emitter, particle, initialize) {
    console.log('InitializeUtil.init called');
    Util.setPrototypeByObj(particle, initialize);
    Util.setVectorByObj(particle, initialize);
  },

  bindEmitter: function(emitter, particle) {
    if (emitter.bindEmitter) {
      const {
        rotation: { x, y, z }
      } = emitter;

      particle.p.add(emitter.p);
      particle.v.add(emitter.v);
      particle.a.add(emitter.a);
      particle.v.applyEuler(particleEuler.set(x, y, z));
    }
  }
};
