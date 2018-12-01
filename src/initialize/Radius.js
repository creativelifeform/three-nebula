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
   * @param {number} width - The width of the particle radius
   * @param {number} height - The height of the particle radius
   * @param {boolean} [center] - Determines whether to average the radius value
   * @return void
   */
  constructor(width, height, center = false) {
    super();

    /**
     * @desc The radius span which is used to set the particle radius value.
     * @type {Span}
     */
    this.radius = createSpan(width, height, center);
  }

  /**
   * Resets the initializer properties.
   * Clears all previously set zones and resets the zones according to args passed.
   *
   * @param {number} width - The width of the particle radius
   * @param {number} height - The height of the particle radius
   * @param {boolean} [shouldCenter] - Determines whether to average the radius value
   * @return void
   */
  reset(width, height, center = false) {
    this.radius = createSpan(width, height, center);
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
