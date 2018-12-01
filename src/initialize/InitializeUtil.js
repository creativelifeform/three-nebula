import { Euler } from 'three';
import Initialize from './Initialize';
import Util from '../utils/Util';

const particleEuler = new Euler();

export default {
  initialize: function(emitter, particle, initializes) {
    var i = initializes.length;

    while (i--) {
      var initialize = initializes[i];

      // TODO remove this conditional, the else is not entered in any of the examples
      // and is just confusing
      /* istanbul ignore else */
      if (initialize instanceof Initialize) initialize.init(emitter, particle);
      else this.init(emitter, particle, initialize);
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
