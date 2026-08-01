import { createZone } from '../zone/createZone';

import Behaviour from './Behaviour';
import { DEFAULT_CROSS_TYPE } from './constants';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_CROSS_ZONE as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';
import type ZoneBase from '../zone/Zone';

interface CrossZoneJSON {
  zoneType: string;
  zoneParams: Record<string, unknown>;
  crossType: string;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that allows for specific functions to be called on particles when
 * they interact with a zone.
 *
 */
export default class CrossZone extends Behaviour {
  zone: ZoneBase;

  /**
   * Constructs a CrossZone behaviour instance.
   *
   * @param zone - the zone used to apply to particles with this behaviour
   * @param crossType - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    zone: ZoneBase,
    crossType?: string,
    life?: number,
    easing?: EasingFunction,
    isEnabled?: boolean
  ) {
    super(life, easing, type, isEnabled);

    this.reset(zone, crossType);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param zone - the zone used to apply to particles with this behaviour
   * @param crossType - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   */
  reset(
    zone: ZoneBase,
    crossType: string = DEFAULT_CROSS_TYPE,
    life?: number,
    easing?: EasingFunction
  ): void {
    /**
     * @desc The zone used to apply to particles with this behaviour
     */
    this.zone = zone;
    this.zone.crossType = crossType;

    life && super.reset(life, easing);
  }

  /**
   * Applies the behaviour to the particle.
   *
   * @see {@link '../zone/Zone.js'} crossing
   * @param particle - the particle to apply the behaviour to
   * @param time - engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    this.zone.crossing.call(this.zone, particle);
  }

  /**
   * Creates a CrossZone initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: CrossZoneJSON): CrossZone {
    const {
      zoneType,
      zoneParams,
      crossType,
      life,
      easing,
      isEnabled = true,
    } = json;

    const zone = createZone(zoneType, Object.values(zoneParams));

    return new CrossZone(
      zone,
      crossType,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
