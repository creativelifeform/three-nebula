import { DR, MEASURE, PI } from '../../constants';
import { MathUtils, Polar3D, Vector3D, createSpan } from '../../math';

import Initializer from '../Initializer';

/**
 * Sets the velocity property on initialized particles.
 *
 * TODO The constructor for this class is insane. This should be broken down into three
 * separate classes, VectorVelocity, PolarVelocity and RadialVelocity, that way
 * it will be much cleaner and there won't be any need for mixed argument types.
 *
 */
export default class PolarVelocity extends Initializer {
  /**
   * Constructs a Velocity intitializer instance.
   *
   * @param {Vector3D|Polar3D|Span|number} a - Vector, Polar or radius (as a number or Span)
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
      /**
       * @desc Velocity radius span.
       * @type {Span}
       */
      this.radiusPan = createSpan(1);

      /**
       * @desc Direction vector.
       * @type {Vector3D}
       */
      this.dir = a.clone();

      /**
       * @desc Theta.
       * @type {number}
       */
      this.tha = b * DR;

      /**
       * @desc Determines whether to use the directional vector or not.
       * @type {boolean}
       */
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

/**
 * Sets the particle's initial velocity.
 * BUG? This seems to always set the dirVec to 0, 0, 0 in the case of polar3d velocity.
 *
 * @singleton
 * @param {Particle} particle - the particle to initialize the property on
 * @return void
 */
Velocity.prototype.initialize = (function() {
  var tha;
  var normal = new Vector3D(0, 0, 1);
  var v = new Vector3D(0, 0, 0);

  return function initialize(particle) {
    tha = this.tha * Math.random();
    this._useV && this.dirVec.copy(this.dir).scalar(this.radiusPan.getValue());

    MathUtils.getNormal(this.dirVec, normal);
    v.copy(this.dirVec).applyAxisAngle(normal, tha);
    v.applyAxisAngle(this.dirVec.normalize(), Math.random() * PI * 2);

    particle.v.copy(v);

    return this;
  };
})();
