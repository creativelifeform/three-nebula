import { MathUtils, Span, createSpan } from '../math';

import Behaviour from './Behaviour';
import { PARTICLE_ALPHA_THRESHOLD } from './constants';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_ALPHA as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';

interface AlphaJSON {
  alphaA: number;
  alphaB?: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that applies an alpha transition effect to particles.
 *
 */
export default class Alpha extends Behaviour {
  alphaA: Span<number>;
  alphaB: Span<number>;
  _same: boolean;

  /**
   * Constructs an Alpha behaviour instance.
   *
   * @param alphaA - The starting alpha value
   * @param alphaB - The ending alpha value
   * @param life - The life of the behaviour
   * @param easing - The easing equation to use for transforms
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    alphaA: number = 1,
    alphaB: number | null = null,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(alphaA, alphaB);
  }

  /**
   * Gets the _same property which determines if the alpha are the same.
   */
  get same(): boolean {
    return this._same;
  }

  /**
   * Sets the _same property which determines if the alpha are the same.
   */
  set same(same: boolean) {
    this._same = same;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param alphaA - the starting alpha value
   * @param alphaB - the ending alpha value
   * @param life - the life of the behaviour
   * @param easing - the easing equation to use for transforms
   */
  reset(
    alphaA: number = 1,
    alphaB: number | null = null,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.same = alphaB === null || alphaB === undefined ? true : false;
    this.alphaA = createSpan(alphaA);
    this.alphaB = createSpan(alphaB);

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   *
   * @param particle - the particle to initialize the behaviour on
   */
  initialize(particle: Particle): void {
    particle.useAlpha = true;
    particle.transform.alphaA = this.alphaA.sample(particle.rng);

    particle.transform.alphaB = this.same
      ? particle.transform.alphaA
      : this.alphaB.sample(particle.rng);
  }

  /**
   * Mutates the target's alpha/opacity property.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    particle.alpha = MathUtils.lerp(
      particle.transform.alphaA as number,
      particle.transform.alphaB as number,
      this.energy
    );

    if (particle.alpha < PARTICLE_ALPHA_THRESHOLD) {
      particle.alpha = 0;
    }
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: AlphaJSON): Alpha {
    const { alphaA, alphaB, life, easing, isEnabled = true } = json;

    return new Alpha(alphaA, alphaB, life, getEasingByName(easing), isEnabled);
  }
}
