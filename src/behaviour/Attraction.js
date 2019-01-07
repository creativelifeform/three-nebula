import {
  DEFAULT_ATTRACITON_RADIUS,
  DEFAULT_ATTRACTION_FORCE_SCALAR,
  DEFAULT_BEHAVIOUR_EASING,
  DEFAULT_LIFE,
  PARTICLE_LENGTH_SQ_THRESHOLD
} from './constants';

import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_ATTRACTION as type } from './types';

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
   * @param {number} [life=DEFAULT_LIFE] - The life of the particle
   * @param {function} [easing=DEFAULT_BEHAVIOUR_EASING] - The behaviour's decaying trend
   * @return void
   */
  constructor(
    targetPosition = new Vector3D(),
    force = DEFAULT_ATTRACTION_FORCE_SCALAR,
    radius = DEFAULT_ATTRACITON_RADIUS,
    life = DEFAULT_LIFE,
    easing = DEFAULT_BEHAVIOUR_EASING
  ) {
    super(life, easing, type);

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
    this.force = this.normalizeValue(force);

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
  reset(
    targetPosition = new Vector3D(),
    force = DEFAULT_ATTRACTION_FORCE_SCALAR,
    radius = DEFAULT_ATTRACITON_RADIUS,
    life,
    easing
  ) {
    this.targetPosition = targetPosition;
    this.radius = radius;
    this.force = this.normalizeValue(force);
    this.radiusSq = this.radius * this.radius;
    this.attractionForce = new Vector3D();
    this.lengthSq = 0;

    life && super.reset(life, easing);
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates particle acceleration.
   *
   * @param {Particle} particle - the particle to apply the behaviour to
   * @param {number} time - particle engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    this.energize(particle, time, index);

    this.attractionForce.copy(this.targetPosition);
    this.attractionForce.sub(particle.position);

    this.lengthSq = this.attractionForce.lengthSq();

    if (
      this.lengthSq > PARTICLE_LENGTH_SQ_THRESHOLD &&
      this.lengthSq < this.radiusSq
    ) {
      this.attractionForce.normalize();
      this.attractionForce.scalar(1 - this.lengthSq / this.radiusSq);
      this.attractionForce.scalar(this.force);

      particle.acceleration.add(this.attractionForce);
    }
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.x - The target position x value
   * @property {number} json.y - The target position y value
   * @property {number} json.z - The target position z value
   * @property {number} json.force - The attraction force scalar multiplier
   * @property {number} json.life - The life of the particle
   * @property {string} json.easing - The behaviour's decaying trend
   * @return {Body}
   */
  static fromJSON(json) {
    const { x, y, z, force, radius, life, easing } = json;

    return new Attraction(
      new Vector3D(x, y, z),
      force,
      radius,
      life,
      getEasingByName(easing)
    );
  }
}
