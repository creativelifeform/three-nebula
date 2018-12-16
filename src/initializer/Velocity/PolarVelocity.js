import { DR } from '../../constants';
import Velocity from './Velocity';

/**
 * Sets the velocity property on initialized particles.
 *
 */
export default class PolarVelocity extends Velocity {
  /**
   * Constructs a PolarVelocity initializer.
   *
   * @param {Polar3D} polar3d - The polar vector for the velocity
   * @param {number} theta - The theta angle to use
   * @return void
   */
  constructor(polar3d, theta) {
    super();

    /**
     * @desc Theta.
     * @type {number}
     */
    this.tha = theta * DR;

    /**
     * @desc Directional vector
     * @type {Vector3D}
     */
    this.dirVec = polar3d.toVector3D();

    /**
     * @desc Determines whether to use the directional vector or not.
     * @type {boolean}
     */
    this._useV = false;
  }
}
