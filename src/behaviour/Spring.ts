import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_SPRING as type } from './types';
import type { EasingFunction } from '../ease';
import type Particle from '../core/Particle';

interface SpringJSON {
  x: number;
  y: number;
  z: number;
  spring: number;
  friction: number;
  life?: number;
  easing?: string;
  isEnabled?: boolean;
}

/**
 * Behaviour that causes particles to spring.
 *
 */
export default class Spring extends Behaviour {
  pos: Vector3D;
  spring: number;
  friction: number;

  /**
   * Constructs a Spring behaviour instance.
   *
   * @param x - X axis spring
   * @param y - Y axis spring
   * @param z - Z axis spring
   * @param spring - Spring factor
   * @param friction - Spring friction
   * @param life - The life of the behaviour
   * @param easing - The easing equation to use for transforms
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    x: number,
    y: number,
    z: number,
    spring: number,
    friction: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(x, y, z, spring, friction);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param x - X axis spring
   * @param y - Y axis spring
   * @param z - Z axis spring
   * @param spring - Spring factor
   * @param friction - Spring friction
   */
  reset(
    x: number,
    y: number,
    z: number,
    spring: number,
    friction: number
  ): void {
    if (!this.pos) {
      this.pos = new Vector3D(x, y, z);
    } else {
      this.pos.set(x, y, z);
    }

    this.spring = spring || 0.1;
    this.friction = friction || 0.98;
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates the particle's velocity according to this.pos and this.spring.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    particle.velocity.x += (this.pos.x - particle.position.x) * this.spring;
    particle.velocity.y += (this.pos.y - particle.position.y) * this.spring;
    particle.velocity.z += (this.pos.z - particle.position.z) * this.spring;
  }

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @param json - JSON object containing the required constructor properties
   */
  static fromJSON(json: SpringJSON): Spring {
    const { x, y, z, spring, friction, life, easing, isEnabled = true } = json;

    return new Spring(
      x,
      y,
      z,
      spring,
      friction,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
