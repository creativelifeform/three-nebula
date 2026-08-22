import { createZone } from '../zone/createZone';

import Initializer from './Initializer';
import { SUPPORTED_JSON_ZONE_TYPES, isSupported } from '../core/constants';
import { INITIALIZER_TYPE_POSITION as type } from './types';
import type ZoneBase from '../zone/Zone';
import type Emitter from '../emitter/Emitter';
import type Particle from '../core/Particle';

interface PositionJSON {
  zoneType?: string;
  [key: string]: unknown;
}

/**
 * Sets the starting position property for initialized particles.
 * This is derived from a zone randomly chosen from those supplied to the constructor.
 *
 */
export default class Position extends Initializer {
  zones: ZoneBase[];

  /**
   * Constructs a Position initializer instance.
   *
   * @param zones - The zones to use as bounds for the particle's starting position
   */
  constructor(...zones: ZoneBase[]) {
    super(type);

    this.reset(...zones);
  }

  /**
   * Resets the initializer properties.
   * Clears all previously set zones and resets the zones according to args passed.
   *
   * @param zones - The zones to use as bounds for the particle's starting position
   */
  reset(...zones: ZoneBase[]): void {
    if (!this.zones) {
      this.zones = [];
    } else {
      this.zones.length = 0;
    }

    /**
     * @desc The zones to use as bounds for calculating the particle's starting position.
     */
    this.zones = this.zones.concat(zones);
  }

  /**
   * Adds a zone or zones to this.zones.
   *
   * @param zones - The zones to add
   */
  addZone(...zones: ZoneBase[]): void {
    this.zones = this.zones.concat(zones);
  }

  /**
   * Sets the particle's initial position.
   *
   * @param target - the particle to initialize the property on
   */
  initialize(target: Emitter | Particle): void {
    const zone = this.zones[(target.rng() * this.zones.length) >> 0];

    zone.getPosition(target.rng);

    target.position.x = zone.vector.x;
    target.position.y = zone.vector.y;
    target.position.z = zone.vector.z;
  }

  /**
   * Creates a Position initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: PositionJSON): Position {
    const { zoneType, ...params } = json;

    if (!zoneType || !isSupported(SUPPORTED_JSON_ZONE_TYPES, zoneType)) {
      throw new Error(
        `The zone type ${zoneType} is invalid or not yet supported`
      );
    }

    return new Position(createZone(zoneType, Object.values(params)));
  }
}
