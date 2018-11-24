import Behaviour from './Behaviour';
import { Vector3D } from '../math';

/**
 * Forces particles along a specific axis.
 *
 */
export default class Force extends Behaviour {
  /**
   * @constructs Force
   *
   * @param {number} fx - the x axis force
   * @param {number} fy - the y axis force
   * @param {number} fz - the z axis force
   * @param {number} life - the life of the particle
   * @param {string} easing - the easing equation to use
   * @return void
   */
  constructor(fx, fy, fz, life, easing) {
    super(life, easing);

    this.reset(fx, fy, fz);
  }

  reset(fx, fy, fz) {
    this.force = this.normalizeForce(new Vector3D(fx, fy, fz));
    this.force.id = Math.random();
  }

  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);
    particle.a.add(this.force);
  }
}
