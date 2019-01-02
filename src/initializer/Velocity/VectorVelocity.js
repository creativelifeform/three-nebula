import { Vector3D, createSpan } from '../../math';

import { DR } from '../../constants';
import Velocity from './Velocity';
import { INITIALIZER_TYPE_VECTOR_VELOCITY as type } from '../types';

/**
 * Sets the velocity property on initialized particles.
 *
 */
export default class VectorVelocity extends Velocity {
  /**
   * Constructs a VectorVelocity initializer.
   *
   * @param {Vector3D} vector3d - The directional vector for the velocity
   * @param {number} theta - The theta angle to use
   * @return void
   */
  constructor(vector3d, theta) {
    super(type);

    /**
     * @desc Velocity radius span.
     * @type {Span}
     */
    this.radiusPan = createSpan(1);

    /**
     * @desc Direction vector.
     * @type {Vector3D}
     */
    this.dir = vector3d.clone();

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
   * Creates a VectorVelocity initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {number} json.x - The velocity x axis direction
   * @param {number} json.y - The velocity y axis direction
   * @param {number} json.z - The velocity z axis direction
   * @param {number} json.theta - The velocity theta
   * @return {VectorVelocity}
   */
  static fromJSON(json) {
    const { x, y, z, theta } = json;

    return new VectorVelocity(new Vector3D(x, y, z), theta);
  }
}
