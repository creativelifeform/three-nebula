import Initializer from './Initializer';
import { createSpan } from '../math';

/**
 * Sets the mass property on initialized particles.
 *
 */
export default class Mass extends Initializer {
  /**
   * Constructs a Mass initializer instance.
   *
   * @param {number} min - The minumum mass for the particle
   * @param {number} max - The maximum mass for the particle
   * @param {?string} center - The center of the mass span
   * @return void
   */
  constructor(a, b, c) {
    super();

    /**
     * @desc The mass span which is used to set the particle mass value.
     * @type {Span}
     */
    this.massPan = createSpan(a, b, c);
  }

  /**
   * Sets the particle's initial mass.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(particle) {
    particle.mass = this.massPan.getValue();
  }
}
