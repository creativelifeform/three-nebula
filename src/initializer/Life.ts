import Initializer from './Initializer';
import { Span, createSpan } from '../math';
import { INITIALIZER_TYPE_LIFE as type } from './types';
import type Particle from '../core/Particle';

interface LifeJSON {
  min?: number;
  max?: number;
  center?: boolean;
  isEnabled?: boolean;
}

/**
 * Sets the life property on initialized particles.
 *
 */
export default class Life extends Initializer {
  lifePan: Span<number>;

  /**
   * Constructs a Life property instance.
   *
   * @param min - The minimum life
   * @param max - The maximum life
   * @param center - Determines whether to average the life value
   * @param isEnabled - Determines if the initializer should be enabled or not
   */
  constructor(
    min?: number,
    max?: number,
    center?: boolean,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    /**
     * @desc The life span of the particle.
     */
    this.lifePan = createSpan(min, max, center);
  }

  /**
   * Sets the particle's initial life.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Particle): void {
    if (this.lifePan.a == Infinity || (this.lifePan.a as unknown) == 'infi') {
      particle.life = Infinity;
    } else {
      particle.life = this.lifePan.getValue();
    }
  }

  /**
   * Creates a Life initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: LifeJSON): Life {
    const { min, max, center = false, isEnabled = true } = json;

    return new Life(min, max, center, isEnabled);
  }
}
