import { Vector3D, createSpan } from '../../math';

import { DR } from '../../constants';
import Velocity from './Velocity';
import { INITIALIZER_TYPE_RADIAL_VELOCITY as type } from '../types';

/**
 * Sets the velocity property on initialized particles.
 *
 */
export default class RadialVelocity extends Velocity {
  /**
   * Constructs a RadialVelocity initializer.
   *
   * @param {number|Span} radius - The velocity radius
   * @param {Vector3D} vector3d - The directional vector for the velocity
   * @param {number} theta - The theta angle to use
   * @return void
   */
  constructor(radius, vector3d, theta, isEnabled = true) {
    super(type, isEnabled);

    /**
     * @desc Velocity radius span.
     * @type {Span}
     */
    this.radiusPan = createSpan(radius);

    /**
     * @desc Direction vector.
     * @type {Vector3D}
     */
    this.dir = vector3d.clone().normalize();

    /**
     * @desc Theta.
     * @type {number}
     */
    this.tha = theta * DR;

    /**
     * @desc Determines whether to use the directional vector or not.
     * @type {boolean}
     */
    this._useV = true;
  }

  /**
   * Creates a RadialVelocity initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {number} json.radius - The velocity radius
   * @param {number} json.x - The velocity x axis direction
   * @param {number} json.y - The velocity y axis direction
   * @param {number} json.z - The velocity z axis direction
   * @param {number} json.theta - The velocity theta
   * @return {RadialVelocity}
   */
  static fromJSON(json) {
    const { radius, x, y, z, theta, isEnabled = true } = json;

    return new RadialVelocity(radius, new Vector3D(x, y, z), theta, isEnabled);
  }
}
