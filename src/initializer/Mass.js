import Initializer from './Initializer';
import { createSpan } from '../math';
import { INITIALIZER_TYPE_MASS as type } from './types';

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
   * @param {boolean} [center] - Determines whether to average the mass value
   * @return void
   */
  constructor(min, max, center = false) {
    super(type);

    /**
     * @desc The mass span which is used to set the particle mass value.
     * @type {Span}
     */
    this.massPan = createSpan(min, max, center);
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

  /**
   * Creates a Mass initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.min - The minimum mass
   * @property {number} json.max - The maximum mass
   * @property {number} json.center - The center of the mass
   * @return {Mass}
   */
  static fromJSON(json) {
    const { min, max, center = false } = json;

    return new Mass(min, max, center);
  }
}
