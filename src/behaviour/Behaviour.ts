import { DEFAULT_BEHAVIOUR_EASING, DEFAULT_LIFE } from './constants';

import { BEHAVIOUR_TYPE_ABSTRACT } from './types';
import { MEASURE } from '../constants';
import isNumber from 'lodash/isNumber';
import { uid } from '../utils';
import type { EasingFunction } from '../ease';
import type Vector3D from '../math/Vector3D';
import type Particle from '../core/Particle';
import type Emitter from '../emitter/Emitter';

/**
 * The base behaviour class.
 * Behaviours manage a particle's behaviour after they have been emitted.
 */
export default class Behaviour {
  type: string;
  isEnabled: boolean;
  id: string;
  _life: number;
  easing: EasingFunction;
  age: number;
  energy: number;
  dead: boolean;

  constructor(
    life: number = Infinity,
    easing: EasingFunction = DEFAULT_BEHAVIOUR_EASING,
    type: string = BEHAVIOUR_TYPE_ABSTRACT,
    isEnabled: boolean = true
  ) {
    this.type = type;
    this.isEnabled = isEnabled;
    this.id = `behaviour-${uid()}`;
    this.life = life;
    this.easing = easing;
    this.age = 0;
    this.energy = 1;
    this.dead = false;
  }

  /**
   * Reset this behaviour's parameters.
   */
  reset(
    life: number = DEFAULT_LIFE,
    easing: EasingFunction = DEFAULT_BEHAVIOUR_EASING
  ): void {
    this.life = life;
    this.easing = easing || DEFAULT_BEHAVIOUR_EASING;
  }

  /**
   * Ensures that life is infinity if an invalid value is supplied.
   */
  set life(life: number) {
    this._life = isNumber(life) ? life : DEFAULT_LIFE;
  }

  /**
   * Gets the behaviour's life.
   */
  get life(): number {
    return this._life;
  }

  /**
   * Normalize a force by 1:100.
   */
  normalizeForce(force: Vector3D): Vector3D {
    return force.scalar(MEASURE);
  }

  /**
   * Normalize a value by 1:100.
   */
  normalizeValue(value: number): number {
    return value * MEASURE;
  }

  /**
   * Set the behaviour's initial properties on the particle.
   *
   * @abstract
   */
  initialize(particle: Particle): void {} // eslint-disable-line

  /**
   * Apply behaviour to the target as a factor of time.
   */
  applyBehaviour(
    target: Particle | Emitter,
    time: number,
    index?: number
  ): void {
    if (!this.isEnabled) {
      return;
    }

    this.mutate(target, time, index);
  }

  /**
   * Change the target's properties according to specific behaviour logic.
   *
   * @abstract
   */
  mutate(target: Particle | Emitter, time: number, index?: number): void {} // eslint-disable-line

  /**
   * Compares the age of the behaviour vs integration time and determines
   * if the behaviour should be set to dead or not.
   */
  energize(particle: Particle, time: number): void {
    if (this.dead) {
      return;
    }

    this.age += time;

    if (this.age >= this.life) {
      this.energy = 0;
      this.dead = true;

      return;
    }

    const scale = this.easing(particle.age / particle.life);

    this.energy = Math.max(1 - scale, 0);
  }

  /**
   * Destroy this behaviour.
   *
   * @abstract
   */
  destroy(): void {}

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @abstract
   */
  fromJSON(json: Record<string, unknown>): void {} // eslint-disable-line
}
