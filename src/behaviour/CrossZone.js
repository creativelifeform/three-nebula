import * as Zone from '../zone';

import Behaviour from './Behaviour';
import { Util } from '../utils';
import { getEasingByName } from '../ease';

/**
 * Behaviour that allows for specific functions to be called on particles when
 * they interact with a zone.
 *
 */
export default class CrossZone extends Behaviour {
  /**
   * Constructs a CrossZone behaviour instance.
   *
   * @param {Zone} a - the zone used to apply to particles with this behaviour
   * @param {string} b - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   */
  constructor(a, b, life, easing) {
    super(life, easing);

    this.reset(a, b);
    this.name = 'CrossZone';
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {Zone} a - the zone used to apply to particles with this behaviour
   * @param {string} b - enum of cross types, valid strings include 'dead', 'bound', 'cross'
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   */
  reset(a, b, life, easing) {
    var zone, crossType;

    // TODO remove the ability for mixed order of arguments
    if (typeof a == 'string') {
      crossType = a;
      zone = b;
    } else {
      crossType = b;
      zone = a;
    }

    /**
     * @desc The zone used to apply to particles with this behaviour
     * @type {Zone}
     */
    this.zone = zone;
    this.zone.crossType = Util.initValue(crossType, 'dead');

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
  fromJSON(json) {
    const { zoneType, zoneParams, crossType, life, easing } = json;

    const zone = new Zone[zoneType](...Object.values(zoneParams));

    return new CrossZone(zone, crossType, life, getEasingByName(easing));
  }
}
