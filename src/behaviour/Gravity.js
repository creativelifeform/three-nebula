import Force from './Force';
import { classDeprecationWarning } from '../compatibility';

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
  }
}

/**
 * Compatibility class.
 *
 * @deprecated
 */
export class G extends Gravity {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('G', 'Gravity'));
  }
}
