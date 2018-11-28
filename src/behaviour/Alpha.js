import { MathUtils, createSpan } from '../math';
import {
  PARTICLE_ALPHA_THRESHOLD,
  DEFAULT_BEHAVIOUR_EASING as defaultEasing
} from './constants';

import Behaviour from './Behaviour';

/**
 * Behaviour that applies an alpha transition effect to particles.
 *
 */
export default class Alpha extends Behaviour {
  /**
   * @constructs {Alpha}
   *
   * @param {number} alphaA - the starting alpha value
   * @param {?number} alphaB - the ending alpha value
   * @param {?number} life - the life of the behaviour
   * @param {function} easing - the easing equation to use for transforms
   * @return void
   */
  constructor(alphaA = 1, alphaB = null, life = null, easing = defaultEasing) {
    super(life, easing);

    this.reset(alphaA, alphaB);
  }

  get same() {
    return this._same;
  }

  set same(same) {
    this._same = same;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {number} alphaA - the starting alpha value
   * @param {?number} alphaB - the ending alpha value
   * @param {?number} life - the life of the behaviour
   * @param {function} easing - the easing equation to use for transforms
   * @return void
   */
  reset(alphaA = 1, alphaB = null, life = null, easing = defaultEasing) {
    this.same = !alphaB ? true : false;

    this.alphaA = createSpan(alphaA);
    this.alphaB = createSpan(alphaB);

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   *
   * @param {object} particle - the particle to initialize the behaviour on
   * @return void
   */
  initialize(particle) {
    particle.useAlpha = true;
    particle.transform.alphaA = this.alphaA.getValue();

    if (this.same) {
      particle.transform.alphaB = particle.transform.alphaA;
    }

    if (!this.same) {
      particle.transform.alphaB = this.alphaB.getValue();
    }
  }

  /**
   * Applies the behaviour to the particle.
   *
   * @augments particle.alpha
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.alpha = MathUtils.lerp(
      particle.transform.alphaA,
      particle.transform.alphaB,
      this.energy
    );

    if (particle.alpha < PARTICLE_ALPHA_THRESHOLD) {
      particle.alpha = 0;
    }
  }
}
