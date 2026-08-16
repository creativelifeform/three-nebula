import Initializer from './Initializer';
import { Span, createSpan } from '../math';
import { INITIALIZER_TYPE_MASS as type } from './types';
import type Particle from '../core/Particle';

interface MassJSON {
  min?: number;
  max?: number;
  center?: boolean;
  isEnabled?: boolean;
}

/**
 * Sets the mass property on initialized particles.
 *
 */
export default class Mass extends Initializer {
  massPan: Span<number>;

  /**
   * Constructs a Mass initializer instance.
   *
   * @param min - The minumum mass for the particle
   * @param max - The maximum mass for the particle
   * @param center - Determines whether to average the mass value
   */
  constructor(
    min?: number,
    max?: number,
    center: boolean = false,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    /**
     * @desc The mass span which is used to set the particle mass value.
     */
    this.massPan = createSpan(min, max, center);
  }

  /**
   * Sets the particle's initial mass.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Particle): void {
    particle.mass = this.massPan.getValue(undefined, particle.rng);
  }

  /**
   * Creates a Mass initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: MassJSON): Mass {
    const { min, max, center = false, isEnabled = true } = json;

    return new Mass(min, max, center, isEnabled);
  }
}
