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
   * @return void
   */
  constructor(gravity, life, easing) {
    super(0, -gravity, 0, life, easing);

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
  }

  static fromJSON(json) {
    const { gravity, life, easing } = json;

    return new Gravity(gravity, life, getEasingByName(easing));
  }
}
