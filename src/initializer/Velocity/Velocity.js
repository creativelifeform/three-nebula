import { MEASURE, PI } from '../../constants';
import { MathUtils, Vector3D } from '../../math';

import Initializer from '../Initializer';

/**
 * Abstract class for Velocity initializers.
 *
 */
export default class Velocity extends Initializer {
  /**
   * Constructs a Velocity intitializer instance.
   *
   * @return void
   */
  constructor(type, isEnabled = true) {
    super(type, isEnabled);

    /**
     * @desc Directional vector
     * @type {Vector3D}
     */
    this.dirVec = new Vector3D(0, 0, 0);
  }

  normalize(vr) {
    return vr * MEASURE;
  }
}

/**
 * Sets the particle's initial velocity.
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

    particle.velocity.copy(v);

    return this;
  };
})();
