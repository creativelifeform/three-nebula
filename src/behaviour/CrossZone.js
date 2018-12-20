import * as Zone from '../zone';

import Behaviour from './Behaviour';
import { DEFAULT_CROSS_TYPE } from './constants';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_CROSS_ZONE as type } from './types';

/**
 * Behaviour that allows for specific functions to be called on particles when
 * they interact with a zone.
 *
 */
export default class CrossZone extends Behaviour {
  /**
   * Constructs a CrossZone behaviour instance.
   *
   * @param {Zone} zone - the zone used to apply to particles with this behaviour
   * @param {string} [crossType=DEFAULT_CROSS_TYPE] - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   */
  constructor(zone, crossType, life, easing) {
    super(life, easing, type);

    this.reset(zone, crossType);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {Zone} zone - the zone used to apply to particles with this behaviour
   * @param {string} [crossType=DEFAULT_CROSS_TYPE] - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   */
  reset(zone, crossType = DEFAULT_CROSS_TYPE, life, easing) {
    /**
     * @desc The zone used to apply to particles with this behaviour
     * @type {Zone}
     */
    this.zone = zone;
    this.zone.crossType = crossType;

    life && super.reset(life, easing);
  }

  /**
   * Applies the behaviour to the particle.
   *
   * @see {@link '../zone/Zone.js'} crossing
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    this.zone.crossing.call(this.zone, particle);
  }

  /**
   * Creates a CrossZone initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @return {CrossZone}
   */
  static fromJSON(json) {
    const { zoneType, zoneParams, crossType, life, easing } = json;

    const zone = new Zone[zoneType](...Object.values(zoneParams));

    return new CrossZone(zone, crossType, life, getEasingByName(easing));
  }
}
