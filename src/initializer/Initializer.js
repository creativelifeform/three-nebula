import { INITIALIZER_TYPE_ABSTRACT } from './types';

/**
 * The base Emitter / Particle property class.
 *
 * @abstract
 */
export default class Initializer {
  /**
   * Constructs an Initializer instance.
   *
   * @param {string} [type=INITIALIZER_TYPE_ABSTRACT] - The intiializer type
   * @param {boolean} [isEnabled=true] - Determines if the initializer should be enabled or not
   * @return void
   */
  constructor(type = INITIALIZER_TYPE_ABSTRACT, isEnabled = true) {
    this.type = type;
    this.isEnabled = isEnabled;
  }

  /**
   * Initializes the property on the emitter or particle.
   *
   * @see {@link '../emitter/emitter.js'} setupParticle
   * @param {Emitter} emitter - the emitter to initialize the property on
   * @param {Particle} particle - the particle to intiialize the property on
   * @return void
   */
  init(emitter, particle) {
    if (!this.isEnabled) {
      return;
    }

    if (particle) {
      this.initialize(particle);
      particle.hasBeenInitialized = true;
    } else {
      this.initialize(emitter);
      emitter.hasBeenInitialized = true;
    }
  }

  /**
   * @abstract
   */
  reset() {}

  /**
   * Place custom property initialization code in this method in the subclass.
   *
   * @param {object} target - either an Emitter or a Particle
   * @abstract
   */
  initialize(target) {} // eslint-disable-line

  /**
   * Returns a new instance of the initializer from the JSON object passed.
   *
   * @abstract
   * @param {object} json - JSON object containing the required constructor properties
   * @return {Behaviour}
   */
  static fromJSON(json) {} // eslint-disable-line
}
