/**
 * The base Emitter / Particle property class.
 *
 * @abstract
 */
export default class Initialize {
  /**
   * Constructs a Property instance.
   *
   * @return void
   */
  constructor() {
    this.name = 'Initialize';
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
}
