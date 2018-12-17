import { DR } from '../../constants';
import { Polar3D } from '../../math';
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

  /**
   * Creates a PolarVelocity initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {number} json.polarRadius - The Polar3D radius
   * @param {number} json.polarTheta - The Polar3D theta
   * @param {number} json.polarPhi - The Polar3D phi
   * @param {number} json.velocityTheta - The velocity theta
   * @return {PolarVelocity}
   */
  static fromJSON(json) {
    const { polarRadius, polarTheta, polarPhi, velocityTheta } = json;

    return new PolarVelocity(
      new Polar3D(polarRadius, polarTheta, polarPhi),
      velocityTheta
    );
  }
}
