import Attraction from './Attraction';

/**
 * Behaviour that causes particles to be repelled from a target position.
 *
 */
export default class Repulsion extends Attraction {
  /**
   * Constructs an Repulsion behaviour instance.
   *
   * @param {Vector3D} targetPosition - The position the particles will be repelled from
   * @param {number} force - The repulsion force scalar multiplier
   * @param {number} radius - The repulsion radius
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @return void
   */
  constructor(targetPosition, force, radius, life, easing) {
    super(targetPosition, force, radius, life, easing);

    this.force *= -1;
    this.name = 'Repulsion';
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
    super.reset(targetPosition, force, radius, life, easing);
    this.force *= -1;
  }
}
