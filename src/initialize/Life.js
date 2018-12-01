import Initializer from './Initializer';
import { createSpan } from '../math';

/**
 * Sets the life property on initialized particles.
 *
 */
export default class Life extends Initializer {
  /**
   * Constructs a Life property instance.
   *
   * @param {number} a - The minimum life
   * @param {number} b - The maximum life
   * @param {?string} c - The span's center
   * @return void
   */
  constructor(a, b, c) {
    super();

    /**
     * @desc The life span of the particle.
     * @type {Span}
     */
    this.lifePan = createSpan(a, b, c);
  }

  /**
   * Sets the particle's initial life.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(target) {
    if (this.lifePan.a == Infinity || this.lifePan.a == 'infi')
      target.life = Infinity;
    else target.life = this.lifePan.getValue();
  }
}
