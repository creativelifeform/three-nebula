import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';

export default class Spring extends Behaviour {
  /**
   * The Behaviour class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */
  constructor(x, y, z, spring, friction, life, easing) {
    super(life, easing);

    this.reset(x, y, z, spring, friction);
    this.name = 'Spring';
  }

  reset(x, y, z, spring, friction) {
    if (!this.pos) this.pos = new Vector3D(x, y, z);
    else this.pos.set(x, y, z);
    this.spring = spring || 0.1;
    this.friction = friction || 0.98;
  }

  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.v.x += (this.pos.x - particle.p.x) * this.spring;
    particle.v.y += (this.pos.y - particle.p.y) * this.spring;
    particle.v.z += (this.pos.z - particle.p.z) * this.spring;
  }

  static fromJSON(json) {
    const { x, y, z, spring, friction, life, easing } = json;

    return new Spring(x, y, z, spring, friction, life, getEasingByName(easing));
  }
}
