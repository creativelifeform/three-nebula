import Initializer from './Initializer';
import { Span, createSpan } from '../math';
import { INITIALIZER_TYPE_RADIUS as type } from './types';
import type Particle from '../core/Particle';

interface RadiusJSON {
  width?: number;
  height?: number;
  center?: boolean;
  isEnabled?: boolean;
}

/**
 * Sets the radius property on initialized particles.
 *
 */
export default class Radius extends Initializer {
  radius: Span<number>;

  /**
   * Constructs a Radius initializer instance.
   *
   * @param width - The width of the particle radius
   * @param height - The height of the particle radius
   * @param center - Determines whether to average the radius value
   */
  constructor(
    width?: number,
    height?: number,
    center: boolean = false,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    /**
     * @desc The radius span which is used to set the particle radius value.
     */
    this.radius = createSpan(width, height, center);
  }

  /**
   * Resets the initializer properties.
   * Clears all previously set zones and resets the zones according to args passed.
   *
   * @param width - The width of the particle radius
   * @param height - The height of the particle radius
   * @param center - Determines whether to average the radius value
   */
  reset(width?: number, height?: number, center: boolean = false): void {
    this.radius = createSpan(width, height, center);
  }

  /**
   * Sets the particle's initial radius.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Particle): void {
    particle.radius = this.radius.getValue();
    particle.transform.oldRadius = particle.radius;
  }

  /**
   * Creates a Radius initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: RadiusJSON): Radius {
    const { width, height, center = false, isEnabled = true } = json;

    return new Radius(width, height, center, isEnabled);
  }
}
