import Behaviour from './Behaviour';
import { Vector3D } from '../math';

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
    super(life, easing);

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
   * Mutates the particle.a property.
   *
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.a.add(this.force);
  }
}
