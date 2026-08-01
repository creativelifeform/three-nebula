import Vector3D from '../math/Vector3D';
import type Particle from '../core/Particle';
import { ZONE_TYPE_ABSTRACT } from './types';

/**
 * A Zone determines the area in 3D space where an emitter's particles can position
 * themselves. They are supplied to both the Position initializer
 * and the CrossZone behaviour.
 *
 * @abstract
 */
export default class Zone {
  type: string;
  vector: Vector3D;
  random: number;
  crossType: string;
  log: boolean;
  supportsCrossing: boolean;

  constructor(type: string = ZONE_TYPE_ABSTRACT) {
    this.type = type;
    this.vector = new Vector3D(0, 0, 0);
    this.random = 0;
    this.crossType = 'dead';
    this.log = true;
    this.supportsCrossing = true;
  }

  getPosition(): Vector3D | null {
    return null;
  }

  crossing(particle: Particle): void {
    if (!this.supportsCrossing) {
      console.warn(
        `${this.constructor.name} does not support the crossing method`
      );

      return;
    }

    switch (this.crossType) {
      case 'bound':
        this._bound(particle);
        break;

      case 'cross':
        this._cross(particle);
        break;

      case 'dead':
        this._dead(particle);
        break;
    }
  }

  isBoxZone(): boolean {
    return false;
  }

  isLineZone(): boolean {
    return false;
  }

  isMeshZone(): boolean {
    return false;
  }

  isPointZone(): boolean {
    return false;
  }

  isScreenZone(): boolean {
    return false;
  }

  isSphereZone(): boolean {
    return false;
  }

  /**
   * Sets the particle's dead property to true if required.
   *
   * @abstract
   */
  _dead(particle: Particle): void {} // eslint-disable-line

  /**
   * @abstract
   */
  _bound(particle: Particle): void {} // eslint-disable-line

  /**
   * @abstract
   */
  _cross(particle: Particle): void {} // eslint-disable-line
}
