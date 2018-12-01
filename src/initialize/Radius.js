import Initializer from './Initializer';
import { createSpan } from '../math';

/**
 * Sets the radius property on initialized particles.
 *
 */
export default class Radius extends Initializer {
  /**
   * Constructs a Radius initializer instance.
   *
   * @param {number} a - The width of the particle radius
   * @param {number} b - The height of the particle radius
   * @param {?string} c - The center of the radius span
   * @return void
   */
  constructor(a, b, c) {
    super();

    /**
     * @desc The radius span which is used to set the particle radius value.
     * @type {Span}
     */
    this.radius = createSpan(a, b, c);
  }

  /**
   * Resets the initializer properties.
   * Clears all previously set zones and resets the zones according to args passed.
   *
   * @param {number} a - The width of the particle radius
   * @param {number} b - The height of the particle radius
   * @param {?string} c - The center of the radius span
   * @return void
   */
  reset(a, b, c) {
    this.radius = createSpan(a, b, c);
  }

  /**
   * Sets the particle's initial radius.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(particle) {
    particle.radius = this.radius.getValue();
    particle.transform.oldRadius = particle.radius;
  }
}
