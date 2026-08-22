import { DR, PI } from '../constants';
import { MathUtils, Span, Vector3D, createSpan } from '../math';

import Behaviour from './Behaviour';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_ROTATE as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';
import type { RNG } from '../math/rng';

interface RotateJSON {
  x: number;
  y: number;
  z: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that rotates particles.
 */
export default class Rotate extends Behaviour {
  x: number | Span<number>;
  y: number | Span<number>;
  z: number | Span<number>;
  _rotationType: string;

  /**
   * Constructs a Rotate behaviour instance.
   *
   * @param x - X axis rotation
   * @param y - Y axis rotation
   * @param z - Z axis rotation
   * @param life - The life of the behaviour
   * @param easing - The easing equation to use for transforms
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    x: number,
    y: number,
    z: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(x, y, z);
  }

  /**
   * Gets the rotation type.
   */
  get rotationType(): string {
    return this._rotationType;
  }

  /**
   * Sets the rotation type.
   */
  set rotationType(rotationType: string) {
    /**
     * @desc The rotation type. ENUM of ['same', 'set', 'to', 'add'].
     */
    this._rotationType = rotationType;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param x - X axis rotation
   * @param y - Y axis rotation
   * @param z - Z axis rotation
   * @param life - the life of the behaviour
   * @param easing - the easing equation to use for transforms
   */
  reset(
    x: number,
    y?: number,
    z?: number,
    life?: number,
    easing?: EasingFunction
  ): void {
    /**
     * @desc X axis rotation.
     */
    this.x = x || 0;

    /**
     * @desc Y axis rotation.
     */
    this.y = y || 0;

    /**
     * @desc Z axis rotation.
     */
    this.z = z || 0;

    if (x === undefined || (x as unknown) == 'same') {
      this.rotationType = 'same';
    } else if (y == undefined) {
      this.rotationType = 'set';
    } else if (z === undefined) {
      this.rotationType = 'to';
    } else {
      this.rotationType = 'add';
      this.x = createSpan((this.x as number) * DR);
      this.y = createSpan((this.y as number) * DR);
      this.z = createSpan((this.z as number) * DR);
    }

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   *
   * @param particle - the particle to initialize the behaviour on
   */
  initialize(particle: Particle): void {
    switch (this.rotationType) {
      case 'same':
        break;

      case 'set':
        this._setRotation(particle.rotation, this.x, particle.rng);
        break;

      case 'to':
        particle.transform.fR = particle.transform.fR || new Vector3D();
        particle.transform.tR = particle.transform.tR || new Vector3D();
        this._setRotation(
          particle.transform.fR as Vector3D,
          this.x,
          particle.rng
        );
        this._setRotation(
          particle.transform.tR as Vector3D,
          this.y,
          particle.rng
        );
        break;

      case 'add':
        particle.transform.addR = new Vector3D(
          (this.x as Span<number>).getValue(false, particle.rng),
          (this.y as Span<number>).getValue(false, particle.rng),
          (this.z as Span<number>).getValue(false, particle.rng)
        );
        break;
    }
  }

  /**
   * Sets the particle's rotation prior to the behaviour being applied.
   *
   * NOTE It's hard to see here, but this is mutating the particle's rotation
   * even though the particle is not being passed in directly.
   *
   * NOTE the else if below will never be reached because the value being passed in
   * will never be of type Vector3D.
   *
   * @param particleRotation - the particle's rotation vector
   * @param value - the value to set the rotation value to, if 'random'
   * rotation is randomised
   */
  _setRotation(
    particleRotation: Vector3D,
    value: number | Span<number> | string,
    rng?: RNG
  ): void {
    particleRotation = particleRotation || new Vector3D();
    if (value == 'random') {
      var x = MathUtils.randomAToB(-PI, PI, undefined, rng);
      var y = MathUtils.randomAToB(-PI, PI, undefined, rng);
      var z = MathUtils.randomAToB(-PI, PI, undefined, rng);

      particleRotation.set(x, y, z);
    }
    // we can't ever get here because value will never be a Vector3D!
    // consider refactoring to
    //  if (value instance of Span) { vec3.add(value.getValue()); }
    else if (value instanceof Vector3D) {
      particleRotation.copy(value);
    }
  }

  /**
   * Mutates the particle.rotation property.
   *
   * @see http://stackoverflow.com/questions/21622956/how-to-convert-direction-vector-to-euler-angles
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    switch (this.rotationType) {
      // orients the particle in the direction it is moving
      case 'same':
        if (!particle.rotation) {
          particle.rotation = new Vector3D();
        }

        particle.rotation.copy(particle.velocity);
        break;

      case 'set':
        //
        break;

      case 'to':
        particle.rotation.x = MathUtils.lerp(
          (particle.transform.fR as Vector3D).x,
          (particle.transform.tR as Vector3D).x,
          this.energy
        );
        particle.rotation.y = MathUtils.lerp(
          (particle.transform.fR as Vector3D).y,
          (particle.transform.tR as Vector3D).y,
          this.energy
        );
        particle.rotation.z = MathUtils.lerp(
          (particle.transform.fR as Vector3D).z,
          (particle.transform.tR as Vector3D).z,
          this.energy
        );
        break;

      case 'add':
        particle.rotation.add(particle.transform.addR as Vector3D);
        break;
    }
  }

  static fromJSON(json: RotateJSON): Rotate {
    const { x, y, z, life, easing, isEnabled = true } = json;

    return new Rotate(x, y, z, life, getEasingByName(easing), isEnabled);
  }
}
