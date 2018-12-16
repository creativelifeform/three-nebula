import Attraction from './Attraction';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';

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

    return new Repulsion(
      new Vector3D(x, y, z),
      force,
      radius,
      life,
      getEasingByName(easing)
    );
  }
}
