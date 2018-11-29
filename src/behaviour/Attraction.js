import {
  DEFAULT_ATTRACITON_RADIUS,
  DEFAULT_ATTRACTION_FORCE_SCALAR,
  PARTICLE_LENGTH_SQ_THRESHOLD,
  DEFAULT_BEHAVIOUR_EASING as defaultEasing
} from './constants';

import Behaviour from './Behaviour';
import { Util } from '../utils';
import { Vector3D } from '../math';

/**
 * Behaviour that causes particles to be attracted to a target position.
 *
 */
export default class Attraction extends Behaviour {
  /**
   * Constructs an Attraction behaviour instance.
   *
   * @param {Vector3D} targetPosition - The position the particles will be attracted to
   * @param {number} force - The attraction force scalar multiplier
   * @param {number} radius - The attraction radius
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @return void
   */
  constructor(
    targetPosition = new Vector3D(),
    force = DEFAULT_ATTRACTION_FORCE_SCALAR,
    radius = DEFAULT_ATTRACITON_RADIUS,
    life = Infinity,
    easing = defaultEasing
  ) {
    super(life, easing);

    /**
     * @desc The position the particles will be attracted to
     * @type {Vector3D}
     */
    this.targetPosition = targetPosition;

    /**
     * @desc The attraction radius
     * @type {number} - the attraction radius
     */
    this.radius = radius;

    /**
     * @desc The attraction force scalar multiplier
     * @type {number}
     */
    this.force = force;

    /**
     * @desc The radius of the attraction squared
     * @type {number}
     */
    this.radiusSq = this.radius * this.radius;

    /**
     * @desc The attraction force in 3D space
     * @type {Vector3D}
     */
    this.attractionForce = new Vector3D();

    /**
     * @desc The linear attraction force
     * @type {number}
     */
    this.lengthSq = 0;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {Vector3D} targetPosition - the position the particles will be attracted to
   * @param {number} force - the attraction force multiplier
   * @param {number} radius - the attraction radius
   * @param {number} life - the life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @return void
   */
  reset(targetPosition, force, radius, life, easing) {
    this.targetPosition = Util.initValue(targetPosition, new Vector3D());
    this.radius = Util.initValue(radius, 1000);
    this.force = Util.initValue(this.normalizeValue(force), 100);
    this.radiusSq = this.radius * this.radius;
    this.attractionForce = new Vector3D();
    this.lengthSq = 0;

    life && super.reset(life, easing);
  }

  /**
   * Applies the behaviour to the particle.
   *
   * @param {Particle} particle - the particle to apply the behaviour to
   * @param {number} time - particle engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);
    this.attractionForce.copy(this.targetPosition);
    this.attractionForce.sub(particle.p);
    this.lengthSq = this.attractionForce.lengthSq();

    if (
      this.lengthSq > PARTICLE_LENGTH_SQ_THRESHOLD &&
      this.lengthSq < this.radiusSq
    ) {
      this.attractionForce.normalize();
      this.attractionForce.scalar(1 - this.lengthSq / this.radiusSq);
      this.attractionForce.scalar(this.force);
      particle.a.add(this.attractionForce);
    }
  }
}
