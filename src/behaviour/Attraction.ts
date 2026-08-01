import {
  DEFAULT_ATTRACITON_RADIUS,
  DEFAULT_ATTRACTION_FORCE_SCALAR,
  DEFAULT_BEHAVIOUR_EASING,
  DEFAULT_LIFE,
  PARTICLE_LENGTH_SQ_THRESHOLD,
} from './constants';

import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_ATTRACTION as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';

interface AttractionJSON {
  x: number;
  y: number;
  z: number;
  force: number;
  radius: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that causes particles to be attracted to a target position.
 *
 */
export default class Attraction extends Behaviour {
  targetPosition: Vector3D;
  radius: number;
  force: number;
  radiusSq: number;
  attractionForce: Vector3D;
  lengthSq: number;

  /**
   * Constructs an Attraction behaviour instance.
   *
   * @param targetPosition - The position the particles will be attracted to
   * @param force - The attraction force scalar multiplier
   * @param radius - The attraction radius
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    targetPosition: Vector3D = new Vector3D(),
    force: number = DEFAULT_ATTRACTION_FORCE_SCALAR,
    radius: number = DEFAULT_ATTRACITON_RADIUS,
    life: number = DEFAULT_LIFE,
    easing: EasingFunction = DEFAULT_BEHAVIOUR_EASING,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    /**
     * @desc The position the particles will be attracted to
     */
    this.targetPosition = targetPosition;

    /**
     * @desc The attraction radius
     */
    this.radius = radius;

    /**
     * @desc The attraction force scalar multiplier
     */
    this.force = this.normalizeValue(force);

    /**
     * @desc The radius of the attraction squared
     */
    this.radiusSq = this.radius * this.radius;

    /**
     * @desc The attraction force in 3D space
     */
    this.attractionForce = new Vector3D();

    /**
     * @desc The linear attraction force
     */
    this.lengthSq = 0;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param targetPosition - the position the particles will be attracted to
   * @param force - the attraction force multiplier
   * @param radius - the attraction radius
   * @param life - the life of the particle
   * @param easing - The behaviour's decaying trend
   */
  reset(
    targetPosition: Vector3D = new Vector3D(),
    force: number = DEFAULT_ATTRACTION_FORCE_SCALAR,
    radius: number = DEFAULT_ATTRACITON_RADIUS,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.targetPosition = targetPosition;
    this.radius = radius;
    this.force = this.normalizeValue(force);
    this.radiusSq = this.radius * this.radius;
    this.attractionForce = new Vector3D();
    this.lengthSq = 0;

    life && super.reset(life, easing);
  }

  /**
   * Mutates particle acceleration.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - particle engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    this.attractionForce.copy(this.targetPosition);
    this.attractionForce.sub(particle.position);

    this.lengthSq = this.attractionForce.lengthSq();

    if (
      this.lengthSq > PARTICLE_LENGTH_SQ_THRESHOLD &&
      this.lengthSq < this.radiusSq
    ) {
      this.attractionForce.normalize();
      this.attractionForce.scalar(1 - this.lengthSq / this.radiusSq);
      this.attractionForce.scalar(this.force);

      particle.acceleration.add(this.attractionForce);
    }
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: AttractionJSON): Attraction {
    const { x, y, z, force, radius, life, easing, isEnabled = true } = json;

    return new Attraction(
      new Vector3D(x, y, z),
      force,
      radius,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
