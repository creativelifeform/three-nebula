import Behaviour from './Behaviour';
import { Vector3D } from '../math';

export default class Force extends Behaviour {
  /**
   * The Behaviour class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */
  constructor(fx, fy, fz, life, easing) {
    super(life, easing);

    this.reset(fx, fy, fz);
    this.name = 'Force';
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
