import Vector3D from '../math/Vector3D';

export default class Zone {
  /**
   * Zone is a base class.
   * @constructor
   */
  constructor() {
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
