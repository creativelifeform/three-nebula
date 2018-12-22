import Vector3D from '../math/Vector3D';
import { ZONE_TYPE_ABSTRACT } from './types';

/**
 * A Zone determines the area in 3D space where an emitter's particles can position
 * themselves. They are supplied to both the Position initializer
 * and the CrossZone behaviour.
 *
 * @see {@link '../initialize/Position.js'}
 * @see {@link '../behaviour/CrossZone.js'}
 * @abstract
 */
export default class Zone {
  /**
   * Constructs a Zone instance.
   *
   * @param {string} type - The zone type
   * @return void
   */
  constructor(type = ZONE_TYPE_ABSTRACT) {
    this.type = type;
    this.vector = new Vector3D(0, 0, 0);
    this.random = 0;
    this.crossType = 'dead';
    this.log = true;
    this.supportsCrossing = true;
  }

  getPosition() {
    return null;
  }

  crossing(particle) {
    if (!this.supportsCrossing) {
      return console.warn(
        `${this.constructor.name} does not support the crossing method`
      );
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

  /**
   * Determines if this zone is a BoxZone.
   *
   * @return {boolean}
   */
  isBoxZone() {
    return false;
  }

  /**
   * Determines if this zone is a LineZone.
   *
   * @return {boolean}
   */
  isLineZone() {
    return false;
  }

  /**
   * Determines if this zone is a MeshZone.
   *
   * @return {boolean}
   */
  isMeshZone() {
    return false;
  }

  /**
   * Determines if this zone is a PointZone.
   *
   * @return {boolean}
   */
  isPointZone() {
    return false;
  }

  /**
   * Determines if this zone is a ScreenZone.
   *
   * @return {boolean}
   */
  isScreenZone() {
    return false;
  }

  /**
   * Determines if this zone is a SphereZone.
   *
   * @return {boolean}
   */
  isSphereZone() {
    return false;
  }

  /**
   * Sets the particle's dead property to true if required.
   *
   * @param {Particle} particle
   * @abstract
   */
  _dead(particle) {} //eslint-disable-line

  /**
   * @abstract
   */
  _bound(particle) {} //eslint-disable-line

  /**
   * @abstract
   */
  _cross(particle) {} //eslint-disable-line
}
