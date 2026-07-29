import { DR } from '../../constants';
import { Polar3D } from '../../math';
import Velocity from './Velocity';
import { INITIALIZER_TYPE_POLAR_VELOCITY as type } from '../types';

interface PolarVelocityJSON {
  polarRadius?: number;
  polarTheta?: number;
  polarPhi?: number;
  velocityTheta?: number;
  isEnabled?: boolean;
}

/**
 * Sets the velocity property on initialized particles.
 *
 */
export default class PolarVelocity extends Velocity {
  /**
   * Constructs a PolarVelocity initializer.
   *
   * @param polar3d - The polar vector for the velocity
   * @param theta - The theta angle to use
   */
  constructor(polar3d: Polar3D, theta: number, isEnabled: boolean = true) {
    super(type, isEnabled);

    /**
     * @desc Theta.
     */
    this.tha = theta * DR;

    /**
     * @desc Directional vector
     */
    this.dirVec = polar3d.toVector3D();

    /**
     * @desc Determines whether to use the directional vector or not.
     */
    this._useV = false;
  }

  /**
   * Creates a PolarVelocity initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: PolarVelocityJSON): PolarVelocity {
    const {
      polarRadius,
      polarTheta,
      polarPhi,
      velocityTheta,
      isEnabled = true,
    } = json;

    return new PolarVelocity(
      new Polar3D(polarRadius, polarTheta, polarPhi),
      velocityTheta,
      isEnabled
    );
  }
}
