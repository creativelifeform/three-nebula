import { PI } from '../constants';
import Util from '../utils/Util';
import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import { ZONE_TYPE_SPHERE as type } from './types';

/**
 * A spherical zone for particles to be emitted within.
 *
 */
export default class SphereZone extends Zone {
  /**
   * @constructs {SphereZone}
   *
   * @param {number} centerX - the sphere's center x coordinate
   * @param {number} centerY - the sphere's center y coordinate
   * @param {number} centerZ - the sphere's center z coordinate
   * @param {number} radius - the sphere's radius value
   * @return void
   */
  constructor(centerX, centerY, centerZ, radius) {
    super(type);

    // TODO see below, these should probably be assigned properly
    // eslint-disable-next-line
    let x, y, z, r;

    if (Util.isUndefined(centerY, centerZ, radius)) {
      x = y = z = 0;
      r = centerX || 100;
    } else {
      x = centerX;
      // eslint-disable-next-line
      y = centerY;
      // eslint-disable-next-line
      z = centerZ;
      r = radius;
    }

    this.x = x;

    // TODO shouldn't this be set to y?
    this.y = x;

    // TODO shouldn't this be set to z?
    this.z = x;
    this.radius = r;
    this.the = this.phi = 0;
  }

  /**
   * Returns true to indicate this is a SphereZone.
   *
   * @return {boolean}
   */
  isSphereZone() {
    return true;
  }

  /**
   * Sets the particle to dead if the particle collides with the sphere.
   *
   * @param {object} particle
   * @return void
   */
  _dead(particle) {
    var d = particle.position.distanceTo(this);

    if (d - particle.radius > this.radius) particle.dead = true;
  }

  /**
   * Warns that this zone does not support the _cross method.
   *
   * @return void
   */
  _cross() {
    console.warn(`${this.constructor.name} does not support the _cross method`);
  }
}

SphereZone.prototype.getPosition = (function() {
  var tha, phi, r;

  return function() {
    this.random = Math.random();

    r = this.random * this.radius;
    tha = PI * Math.random(); //[0-pi]
    phi = PI * 2 * Math.random(); //[0-2pi]

    this.vector.x = this.x + r * Math.sin(tha) * Math.cos(phi);
    this.vector.y = this.y + r * Math.sin(phi) * Math.sin(tha);
    this.vector.z = this.z + r * Math.cos(tha);

    return this.vector;
  };
})();

SphereZone.prototype._bound = (function() {
  var normal = new Vector3D(),
    v = new Vector3D(),
    k;

  return function(particle) {
    var d = particle.position.distanceTo(this);

    if (d + particle.radius >= this.radius) {
      normal
        .copy(particle.position)
        .sub(this)
        .normalize();
      v.copy(particle.velocity);
      k = 2 * v.dot(normal);
      particle.velocity.sub(normal.scalar(k));
    }
  };
})();
