import { DR, MEASURE, PI } from '../constants';
import { MathUtils, Polar3D, Vector3D, createSpan } from '../math';

import Initializer from './Initializer';
import { classDeprecationWarning } from '../compatibility';

export default class Velocity extends Initializer {
  /**
   * Velocity is init particle's Velocity
   * @param {Number} a - the Life's start point
   * @param {Number} b - the Life's end point
   * @param {String} c - span's center
   * @example
   * var life = new Life(3,5);
   * or
   * var life = new Life(Infinity);
   * @extends {Initializer}
   * @constructor
   */
  //radius and tha
  constructor(a, b, c) {
    super();

    this.reset(a, b, c);
    this.dirVec = new Vector3D(0, 0, 0);
    this.name = 'Velocity';
  }

  reset(a, b, c) {
    //[vector,tha]
    if (a instanceof Vector3D) {
      this.radiusPan = createSpan(1);
      this.dir = a.clone();
      this.tha = b * DR;
      this._useV = true;
    }

    //[polar,tha]
    else if (a instanceof Polar3D) {
      this.tha = b * DR;
      this.dirVec = a.toVector3D();
      this._useV = false;
    }

    //[radius,vector,tha]
    else {
      this.radiusPan = createSpan(a);
      this.dir = b.clone().normalize();
      this.tha = c * DR;
      this._useV = true;
    }
  }

  normalize(vr) {
    return vr * MEASURE;
  }
}

Velocity.prototype.initialize = (function() {
  var tha;
  var normal = new Vector3D(0, 0, 1);
  var v = new Vector3D(0, 0, 0);

  return function initialize(target) {
    tha = this.tha * Math.random();
    this._useV && this.dirVec.copy(this.dir).scalar(this.radiusPan.getValue());

    MathUtils.getNormal(this.dirVec, normal);
    v.copy(this.dirVec).applyAxisAngle(normal, tha);
    v.applyAxisAngle(this.dirVec.normalize(), Math.random() * PI * 2);

    target.v.copy(v);

    return this;
  };
})();

/**
 * Compatibility class.
 *
 * @deprecated
 */
export class V extends Velocity {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('V', 'Velocity'));
  }
}
