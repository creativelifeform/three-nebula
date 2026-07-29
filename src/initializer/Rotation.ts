import { Vector3 } from '../core/three';
import Initializer from './Initializer';
import { INITIALIZER_TYPE_ROTATION as type } from './types';
import type Particle from '../core/Particle';

interface RotationJSON {
  x?: number;
  y?: number;
  z?: number;
  useEmitterRotation?: boolean;
  isEnabled?: boolean;
}

/**
 * Sets the rotation property on initialized particles.
 *
 */
export default class Rotation extends Initializer {
  rotation: Vector3;
  useEmitterRotation: boolean;

  /**
   * Constructs a Rotation property instance.
   *
   * @param x - X axis rotation
   * @param y - Y axis rotation
   * @param z - Z axis rotation
   * @param useEmitterRotation - Determines if we should use the emitter's rotation as the starting rotation
   * @param isEnabled - Determines if the initializer should be enabled or not
   */
  constructor(
    x?: number,
    y?: number,
    z?: number,
    useEmitterRotation: boolean = true,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);
    this.rotation = new Vector3(x, y, z);
    this.useEmitterRotation = useEmitterRotation;
  }

  /**
   * Sets the particle's initial rotation.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Particle): void {
    if (this.useEmitterRotation) {
      // set initial particle rotation to that of the particle's emitter then add our set rotation
      particle.rotation.copy(particle.parent.rotation).add(this.rotation);
    } else {
      particle.rotation.copy(this.rotation);
    }
  }

  static fromJSON(json: RotationJSON): Rotation {
    const { x, y, z, useEmitterRotation = true, isEnabled = true } = json;

    return new Rotation(x, y, z, useEmitterRotation, isEnabled);
  }
}
