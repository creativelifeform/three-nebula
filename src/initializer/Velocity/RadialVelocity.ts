import { Span, Vector3D, createSpan } from '../../math';

import { DR } from '../../constants';
import Velocity from './Velocity';
import { INITIALIZER_TYPE_RADIAL_VELOCITY as type } from '../types';

interface RadialVelocityJSON {
  radius?: number;
  x?: number;
  y?: number;
  z?: number;
  theta?: number;
  isEnabled?: boolean;
}

/**
 * Sets the velocity property on initialized particles.
 *
 */
export default class RadialVelocity extends Velocity {
  /**
   * Constructs a RadialVelocity initializer.
   *
   * @param radius - The velocity radius
   * @param vector3d - The directional vector for the velocity
   * @param theta - The theta angle to use
   */
  constructor(
    radius: number | Span,
    vector3d: Vector3D,
    theta: number,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    /**
     * @desc Velocity radius span.
     */
    this.radiusPan = createSpan(radius);

    /**
     * @desc Direction vector.
     */
    this.dir = vector3d.clone().normalize();

    /**
     * @desc Theta.
     */
    this.tha = theta * DR;

    /**
     * @desc Determines whether to use the directional vector or not.
     */
    this._useV = true;
  }

  /**
   * Creates a RadialVelocity initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: RadialVelocityJSON): RadialVelocity {
    const { radius, x, y, z, theta, isEnabled = true } = json;

    return new RadialVelocity(radius, new Vector3D(x, y, z), theta, isEnabled);
  }
}
