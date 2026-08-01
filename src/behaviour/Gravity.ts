import Force from './Force';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_GRAVITY as type } from './types';
import type { EasingFunction, EaseName } from '../ease';

interface GravityJSON {
  gravity: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that forces particles down the y axis.
 *
 */
export default class Gravity extends Force {
  /**
   * Constructs a Gravity behaviour instance.
   *
   * @param gravity - the force to pull the particle down the y axis
   * @param life - the life of the particle
   * @param easing - the easing equation to use
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    gravity: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(0, -gravity, 0, life, easing, isEnabled);

    /**
     * @desc The class type.
     */
    this.type = type;
  }

  static fromJSON(json: GravityJSON): Gravity {
    const { gravity, life, easing, isEnabled = true } = json;

    return new Gravity(gravity, life, getEasingByName(easing), isEnabled);
  }
}
