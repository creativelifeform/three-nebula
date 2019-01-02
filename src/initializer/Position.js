import * as Zone from '../zone';

import Initializer from './Initializer';
import { SUPPORTED_JSON_ZONE_TYPES } from '../core/constants';
import { INITIALIZER_TYPE_POSITION as type } from './types';

/**
 * Sets the starting position property for initialized particles.
 * This is respective to the supplied zones.
 *
 */
export default class Position extends Initializer {
  /**
   * Constructs a Position initializer instance.
   *
   * @param {Zone|array<Zone>} zones - The zones to use to calculate particle starting position.
   * @return void
   */
  constructor() {
    super(type);

    this.reset.apply(this, arguments);
  }

  /**
   * Resets the initializer properties.
   * Clears all previously set zones and resets the zones according to args passed.
   *
   * @param {Zone|array<Zone>} zones - The zones to use to calculate particle starting position.
   * @return void
   */
  reset() {
    if (!this.zones) this.zones = [];
    else this.zones.length = 0;

    var args = Array.prototype.slice.call(arguments);

    /**
     * @desc The zones to use as bounds for calculating the particle's starting position.
     * @type {array<Zone>}
     */
    this.zones = this.zones.concat(args);
  }

  /**
   * Adds a zone or zones to this.zones.
   *
   * @param {Zone|array<Zone>} zones - The zones to use to calculate particle starting position.
   * @return void
   */
  addZone() {
    var args = Array.prototype.slice.call(arguments);

    this.zones = this.zones.concat(args);
  }

  /**
   * Creates a Position initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {string} json.zoneType - The type of zone to use for initial position
   * @return {Position}
   */
  static fromJSON(json) {
    const { zoneType, ...params } = json;

    if (!SUPPORTED_JSON_ZONE_TYPES.includes(zoneType)) {
      throw new Error(
        `The zone type ${zoneType} is invalid or not yet supported`
      );
    }

    return new Position(new Zone[zoneType](...Object.values(params)));
  }
}

/**
 * Sets the particle's initial position.
 *
 * @param {Particle} particle - the particle to initialize the property on
 * @return void
 */
Position.prototype.initialize = (function() {
  let zone;

  return function(target) {
    zone = this.zones[(Math.random() * this.zones.length) >> 0];

    zone.getPosition();

    target.p.x = zone.vector.x;
    target.p.y = zone.vector.y;
    target.p.z = zone.vector.z;
  };
})();
