import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_FORCE as type } from './types';
import type { EasingFunction } from '../ease';
import type Particle from '../core/Particle';

interface ForceJSON {
  fx?: number;
  fy?: number;
  fz?: number;
  life?: number;
  easing?: string;
  isEnabled?: boolean;
}

/**
 * Behaviour that forces particles along a specific axis.
 *
 */
export default class Force extends Behaviour {
  force: Vector3D & { id: number };

  /**
   * Constructs a Force behaviour instance.
   *
   * @param fx - the x axis force
   * @param fy - the y axis force
   * @param fz - the z axis force
   * @param life - the life of the particle
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    fx: number,
    fy: number,
    fz: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(fx, fy, fz);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param fx - the x axis force
   * @param fy - the y axis force
   * @param fz - the z axis force
   */
  reset(fx: number, fy: number, fz: number): void {
    /**
     * @desc The normalized force to exert on the particle in
     */
    this.force = this.normalizeForce(new Vector3D(fx, fy, fz)) as Vector3D & {
      id: number;
    };

    /**
     * @desc The id of the force vector
     */
    this.force.id = Math.random();
  }

  /**
   * Mutates the particle.acceleration property.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    particle.acceleration.add(this.force);
  }

  /**
   * Creates a Force initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: ForceJSON): Force {
    const { fx, fy, fz, life, easing, isEnabled = true } = json;

    return new Force(fx, fy, fz, life, getEasingByName(easing), isEnabled);
  }
}
