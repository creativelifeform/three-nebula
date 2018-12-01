import { DR, MEASURE, PI } from '../constants';
import { MathUtils, Polar3D, Vector3D, createSpan } from '../math';

import Initializer from './Initializer';
import { classDeprecationWarning } from '../compatibility';

/**
 * Sets the velocity property on initialized particles.
 *
 * TODO The constructor for this class is insane. This should be broken down into three
 * separate classes, VectorVelocity, PolarVelocity and RadialVelocity, that way
 * it will be much cleaner and there won't be any need for mixed argument types.
 *
 */
export default class Velocity extends Initializer {
  /**
   * Constructs a Velocity intitializer instance.
   *
   * @param {Vector3D|Polar3D|Span|number} a - Vector, Polar or radius
   * @param {number|Vector3D} b - Theta or Vector
   * @param {number} c - Theta
   */
  constructor(a, b, c) {
    super();

    this.reset(a, b, c);
    /**
     * @desc Directional vector
     * @type {Vector3D}
     */
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
