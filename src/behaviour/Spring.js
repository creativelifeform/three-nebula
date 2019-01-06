import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_SPRING as type } from './types';

/**
 * Behaviour that causes particles to spring.
 *
 */
export default class Spring extends Behaviour {
  /**
   * Constructs a Spring behaviour instance.
   *
   * @param {number} x - X axis spring
   * @param {number} y - Y axis spring
   * @param {number} z - Z axis spring
   * @param {number} spring - Spring factor
   * @param {number} friction - Spring friction
   * @param {number} life - The life of the behaviour
   * @param {function} easing - The easing equation to use for transforms
   * @return void
   */
  constructor(x, y, z, spring, friction, life, easing) {
    super(life, easing, type);

    this.reset(x, y, z, spring, friction);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {number} x - X axis spring
   * @param {number} y - Y axis spring
   * @param {number} z - Z axis spring
   * @param {number} spring - Spring factor
   * @param {number} friction - Spring friction
   * @return void
   */
  reset(x, y, z, spring, friction) {
    if (!this.pos) {
      this.pos = new Vector3D(x, y, z);
    } else {
      this.pos.set(x, y, z);
    }

    this.spring = spring || 0.1;
    this.friction = friction || 0.98;
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates the particle's velocity according to this.pos and this.spring.
   *
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.velocity.x += (this.pos.x - particle.position.x) * this.spring;
    particle.velocity.y += (this.pos.y - particle.position.y) * this.spring;
    particle.velocity.z += (this.pos.z - particle.position.z) * this.spring;
  }

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @param {object} json - JSON object containing the required constructor properties
   * @return {Spring}
   */
  static fromJSON(json) {
    const { x, y, z, spring, friction, life, easing } = json;

    return new Spring(x, y, z, spring, friction, life, getEasingByName(easing));
  }
}
