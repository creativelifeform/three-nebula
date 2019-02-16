import { MathUtils, createSpan } from '../math';

import Behaviour from './Behaviour';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_SCALE as type } from './types';

/**
 * Behaviour that scales particles.
 *
 */
export default class Scale extends Behaviour {
  /**
   * Constructs a Scale behaviour instance.
   *
   * @param {number} scaleA - the starting scale value
   * @param {?number} scaleB - the ending scale value
   * @param {number} life - the life of the behaviour
   * @param {function} easing - the easing equation to use for transforms
   * @param {boolean} [isEnabled=true] - Determines if the behaviour will be applied or not
   * @return void
   */
  constructor(scaleA, scaleB, life, easing, isEnabled = true) {
    super(life, easing, type, isEnabled);

    this.reset(scaleA, scaleB);
  }

  /**
   * Gets the _same property which determines if the scale props are the same.
   *
   * @return {boolean}
   */
  get same() {
    return this._same;
  }

  /**
   * Sets the _same property which determines if the scale props are the same.
   *
   * @param {boolean} same
   * @return {boolean}
   */
  set same(same) {
    /**
     * @type {boolean}
     */
    this._same = same;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {number} scaleA - the starting scale value
   * @param {?number} scaleB - the ending scale value
   * @param {number} life - the life of the behaviour
   * @param {function} easing - the easing equation to use for transforms
   * @return void
   */
  reset(scaleA, scaleB, life, easing) {
    this.same = scaleB === null || scaleB === undefined ? true : false;

    /**
     * @desc The starting scale.
     * @type {Span}
     */
    this.scaleA = createSpan(scaleA || 1);

    /**
     * @desc The ending scale.
     * @type {Span}
     */
    this.scaleB = createSpan(scaleB);

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   * Stores initial values for comparison and mutation in the applyBehaviour method.
   *
   * @param {object} particle - the particle to initialize the behaviour on
   * @return void
   */
  initialize(particle) {
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
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    this.energize(particle, time, index);

    particle.scale = MathUtils.lerp(
      particle.transform.scaleA,
      particle.transform.scaleB,
      this.energy
    );

    if (particle.scale < 0.0005) {
      particle.scale = 0;
    }

    particle.radius = particle.transform.oldRadius * particle.scale;
  }

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @param {object} json - JSON object containing the required constructor properties
   * @return {Spring}
   */
  static fromJSON(json) {
    const { scaleA, scaleB, life, easing, isEnabled = true } = json;

    return new Scale(scaleA, scaleB, life, getEasingByName(easing), isEnabled);
  }
}
