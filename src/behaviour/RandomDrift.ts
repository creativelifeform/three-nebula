import { MathUtils, Span, Vector3D, createSpan } from '../math';

import Behaviour from './Behaviour';
import { DEFAULT_RANDOM_DRIFT_DELAY } from './constants';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_RANDOM_DRIFT as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';

interface RandomDriftJSON {
  x: number;
  y: number;
  z: number;
  delay?: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that causes particles to drift to random coordinates in 3D space.
 *
 */
export default class RandomDrift extends Behaviour {
  randomForce: Vector3D;
  delayPan: Span<number>;
  time: number;

  /**
   * Constructs a RandomDrift behaviour instance.
   *
   * @param driftX - x axis drift
   * @param driftY - y axis drift
   * @param driftZ - z axis drift
   * @param delay - drift delay
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   */
  constructor(
    driftX: number,
    driftY: number,
    driftZ: number,
    delay: number = DEFAULT_RANDOM_DRIFT_DELAY,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(driftX, driftY, driftZ, delay);

    /**
     * @desc Internal time used for calculating drift vs internal delay.
     */
    this.time = 0;
  }

  /**
   * Resets the behaviour properties.
   *
   * @param driftX - x axis drift
   * @param driftY - y axis drift
   * @param driftZ - z axis drift
   * @param delay - drift delay
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   */
  reset(
    driftX: number,
    driftY: number,
    driftZ: number,
    delay: number = DEFAULT_RANDOM_DRIFT_DELAY,
    life?: number,
    easing?: EasingFunction
  ): void {
    /**
     * @desc A Vector3D that stores the drift properties.
     */
    this.randomForce = this.normalizeForce(
      new Vector3D(driftX, driftY, driftZ)
    );
    /**
     * @desc A Span containing the delay supplied.
     */
    this.delayPan = createSpan(delay);
    this.time = 0;

    life && super.reset(life, easing);
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

    this.time += time;

    if (this.time >= this.delayPan.getValue()) {
      const ax = MathUtils.randomAToB(-this.randomForce.x, this.randomForce.x);
      const ay = MathUtils.randomAToB(-this.randomForce.y, this.randomForce.y);
      const az = MathUtils.randomAToB(-this.randomForce.z, this.randomForce.z);

      particle.acceleration.addValue(ax, ay, az);

      this.time = 0;
    }
  }

  static fromJSON(json: RandomDriftJSON): RandomDrift {
    const { x, y, z, delay, life, easing, isEnabled = true } = json;

    return new RandomDrift(
      x,
      y,
      z,
      delay,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
