import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_FORCE as type } from './types';
/**
 * Behaviour that forces particles along a specific axis.
 *
 */
export default class Force extends Behaviour {
  /**
   * Constructs a Force behaviour instance.
   *
   * @param {number} fx - the x axis force
   * @param {number} fy - the y axis force
   * @param {number} fz - the z axis force
   * @param {number} life - the life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @return void
   */
  constructor(fx, fy, fz, life, easing) {
    super(life, easing, type);

    this.reset(fx, fy, fz);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {number} fx - the x axis force
   * @param {number} fy - the y axis force
   * @param {number} fz - the z axis force
   */
  reset(fx, fy, fz) {
    /**
     * @desc The normalized force to exert on the particle in
     * @type {Vector3D}
     */
    this.force = this.normalizeForce(new Vector3D(fx, fy, fz));

    /**
     * @desc The id of the force vector
     * @property {number} this.force.id
     */
    this.force.id = Math.random();
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates the particle.acceleration property.
   *
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.acceleration.add(this.force);
  }

  /**
   * Creates a Force initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @return {Force}
   */
  static fromJSON(json) {
    const { fx, fy, fz, life, easing } = json;

    return new Force(fx, fy, fz, life, getEasingByName(easing));
  }
}
