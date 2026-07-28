import { MathUtils, Span, createSpan } from '../math';

import Behaviour from './Behaviour';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_SCALE as type } from './types';
import type { EasingFunction } from '../ease';
import type Particle from '../core/Particle';

interface ScaleJSON {
  scaleA: number;
  scaleB?: number;
  life?: number;
  easing?: string;
  isEnabled?: boolean;
}

/**
 * Behaviour that scales particles.
 *
 */
export default class Scale extends Behaviour {
  scaleA: Span<number>;
  scaleB: Span<number>;
  _same: boolean;

  /**
   * Constructs a Scale behaviour instance.
   *
   * @param scaleA - the starting scale value
   * @param scaleB - the ending scale value
   * @param life - the life of the behaviour
   * @param easing - the easing equation to use for transforms
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    scaleA: number,
    scaleB: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(scaleA, scaleB);
  }

  /**
   * Gets the _same property which determines if the scale props are the same.
   */
  get same(): boolean {
    return this._same;
  }

  /**
   * Sets the _same property which determines if the scale props are the same.
   */
  set same(same: boolean) {
    this._same = same;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param scaleA - the starting scale value
   * @param scaleB - the ending scale value
   * @param life - the life of the behaviour
   * @param easing - the easing equation to use for transforms
   */
  reset(
    scaleA: number,
    scaleB: number,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.same = scaleB === null || scaleB === undefined ? true : false;

    /**
     * @desc The starting scale.
     */
    this.scaleA = createSpan(scaleA || 1);

    /**
     * @desc The ending scale.
     */
    this.scaleB = createSpan(scaleB);

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   * Stores initial values for comparison and mutation in the applyBehaviour method.
   *
   * @param particle - the particle to initialize the behaviour on
   */
  initialize(particle: Particle): void {
    particle.transform.scaleA = this.scaleA.getValue();
    particle.transform.oldRadius = particle.radius;

    particle.transform.scaleB = this.same
      ? particle.transform.scaleA
      : this.scaleB.getValue();
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates the particle's scale and its radius according to this scale.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    particle.scale = MathUtils.lerp(
      particle.transform.scaleA as number,
      particle.transform.scaleB as number,
      this.energy
    );

    if (particle.scale < 0.0005) {
      particle.scale = 0;
    }

    particle.radius = (particle.transform.oldRadius as number) * particle.scale;
  }

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @param json - JSON object containing the required constructor properties
   */
  static fromJSON(json: ScaleJSON): Scale {
    const { scaleA, scaleB, life, easing, isEnabled = true } = json;

    return new Scale(scaleA, scaleB, life, getEasingByName(easing), isEnabled);
  }
}
