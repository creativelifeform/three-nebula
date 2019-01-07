import Initializer from './Initializer';
import { createSpan } from '../math';
import { INITIALIZER_TYPE_LIFE as type } from './types';

/**
 * Sets the life property on initialized particles.
 *
 */
export default class Life extends Initializer {
  /**
   * Constructs a Life property instance.
   *
   * @param {number} min - The minimum life
   * @param {number} max - The maximum life
   * @param {boolean} [center] - Determines whether to average the life value
   * @return void
   */
  constructor(min, max, center) {
    super(type);

    /**
     * @desc The life span of the particle.
     * @type {Span}
     */
    this.lifePan = createSpan(min, max, center);
  }

  /**
   * Sets the particle's initial life.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(particle) {
    if (this.lifePan.a == Infinity || this.lifePan.a == 'infi') {
      particle.life = Infinity;
    } else {
      particle.life = this.lifePan.getValue();
    }
  }

  /**
   * Creates a Life initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.min - The minimum life time
   * @property {number} json.max - The maximum life time
   * @property {number} json.center - The center of the life time
   * @return {Life}
   */
  static fromJSON(json) {
    const { min, max, center = false } = json;

    return new Life(min, max, center);
  }
}
