import Initializer from './Initializer';
import { createSpan } from '../math';
import { INITIALIZER_TYPE_RADIUS as type } from './types';
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
   * @param {boolean} [center=false] - Determines whether to average the radius value
   * @return void
   */
  constructor(width, height, center = false, isEnabled = true) {
    super(type, isEnabled);

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
   * @param {boolean} [center=false] - Determines whether to average the radius value
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

  /**
   * Creates a Radius initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.width - The width of the particle radius
   * @property {number} json.height - The height of the particle radius
   * @property {number} json.center - The center of the particle radius
   * @return {Radius}
   */
  static fromJSON(json) {
    const { width, height, center = false, isEnabled = true } = json;

    return new Radius(width, height, center, isEnabled);
  }
}
