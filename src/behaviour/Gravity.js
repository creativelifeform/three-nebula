import Force from './Force';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_GRAVITY as type } from './types';

/**
 * Behaviour that forces particles down the y axis.
 *
 */
export default class Gravity extends Force {
  /**
   * Constructs a Gravity behaviour instance.
   *
   * @param {number} gravity - the force to pull the particle down the y axis
   * @param {number} life - the life of the particle
   * @param {string} easing - the easing equation to use
   * @param {boolean} [isEnabled=true] - Determines if the behaviour will be applied or not
   * @return void
   */
  constructor(gravity, life, easing, isEnabled = true) {
    super(0, -gravity, 0, life, easing, isEnabled);

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
  }

  static fromJSON(json) {
    const { gravity, life, easing, isEnabled = true } = json;

    return new Gravity(gravity, life, getEasingByName(easing), isEnabled);
  }
}
