import { Vector3D, createSpan } from '../../math';

import { DR } from '../../constants';
import Velocity from './Velocity';
import { INITIALIZER_TYPE_VECTOR_VELOCITY as type } from '../types';

interface VectorVelocityJSON {
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
export default class VectorVelocity extends Velocity {
  /**
   * Constructs a VectorVelocity initializer.
   *
   * @param vector3d - The directional vector for the velocity
   * @param theta - The theta angle to use
   */
  constructor(vector3d: Vector3D, theta: number, isEnabled: boolean = true) {
    super(type, isEnabled);

    /**
     * @desc Velocity radius span.
     */
    this.radiusPan = createSpan(1);

    /**
     * @desc Direction vector.
     */
    this.dir = vector3d.clone();

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
   * Creates a VectorVelocity initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: VectorVelocityJSON): VectorVelocity {
    const { x, y, z, theta, isEnabled = true } = json;

    return new VectorVelocity(new Vector3D(x, y, z), theta!, isEnabled);
  }
}
