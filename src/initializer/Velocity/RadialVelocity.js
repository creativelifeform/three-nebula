import { DR } from '../../constants';
import Velocity from './Velocity';
import { createSpan } from '../../math';

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
  constructor(radius, vector3d, theta) {
    super();

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
}
