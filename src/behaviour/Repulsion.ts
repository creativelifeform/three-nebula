import Attraction from './Attraction';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_REPULSION as type } from './types';
import type { EasingFunction, EaseName } from '../ease';

interface RepulsionJSON {
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
 * Behaviour that causes particles to be repelled from a target position.
 *
 */
export default class Repulsion extends Attraction {
  /**
   * Constructs an Repulsion behaviour instance.
   *
   * @param targetPosition - The position the particles will be repelled from
   * @param force - The repulsion force scalar multiplier
   * @param radius - The repulsion radius
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   */
  constructor(
    targetPosition: Vector3D,
    force: number,
    radius: number,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(targetPosition, force, radius, life, easing, isEnabled);

    /**
     * @desc Repulsion is attraction with negative force.
     */
    this.force *= -1;

    /**
     * @desc The class type.
     */
    this.type = type;
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
    targetPosition: Vector3D,
    force: number,
    radius: number,
    life?: number,
    easing?: EasingFunction
  ): void {
    super.reset(targetPosition, force, radius, life, easing);
    this.force *= -1;
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: RepulsionJSON): Repulsion {
    const { x, y, z, force, radius, life, easing, isEnabled = true } = json;

    return new Repulsion(
      new Vector3D(x, y, z),
      force,
      radius,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
