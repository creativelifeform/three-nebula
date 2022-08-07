import { Vector3 } from '../core/three';
import Initializer from './Initializer';
import { INITIALIZER_TYPE_ROTATION as type } from './types';

/**
 * Sets the rotation property on initialized particles.
 *
 */
export default class Rotation extends Initializer {
  /**
   * Constructs a Rotation property instance.
   *
   * @param {number} x - X axis rotation
   * @param {number} y - Y axis rotation
   * @param {number} z - Z axis rotation
   * @param {boolean} [useEmitterRotation=true] - Determines if we should use the emitter's rotation as the starting rotation
   * @param {boolean} [isEnabled=true] - Determines if the initializer should be enabled or not
   * @return void
   */
  constructor(x, y, z, useEmitterRotation=true, isEnabled = true) {
    super(type, isEnabled);
    this.rotation = new Vector3(x,y,z);
    this.useEmitterRotation = useEmitterRotation;
  }

  /**
   * Sets the particle's initial rotation.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(particle) {
    if(this.useEmitterRotation)
    {
      // set initial particle rotation to that of the particle's emitter then add our set rotation
      particle.rotation.copy(particle.parent.rotation).add(this.rotation);
    }
    else
    {
      particle.rotation.copy(this.rotation);
    }
  }

  static fromJSON(json) {
    const { x, y, z, useEmitterRotation = true, isEnabled = true } = json;

    return new Rotation(x, y, z, useEmitterRotation, isEnabled);
  }
}