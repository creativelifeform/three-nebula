import { PI } from '../constants';
import Util from '../utils/Util';
import Vector3D from '../math/Vector3D';
import Zone from './Zone';

export default class SphereZone extends Zone {
  /**
   * SphereZone is a sphere zone
   * @param {Number|Vector3D} x - the center's x value or a Vector3D Object
   * @param {Number} y - the center's y value or the Sphere's radius
   * @param {Number} z - the center's z value
   * @param {Number} r - the Sphere's radius
   * @example
   * var sphereZone = new SphereZone(0,0,0,100);
   * var sphereZone = new SphereZone(new Vector3D(0,0,0),100);
   * @extends {Zone}
   * @constructor
   */
  constructor(a, b, c, d) {
    super();

    // TODO see below, these should probably be assigned properly
    // eslint-disable-next-line
    var x, y, z, r;

    if (Util.isUndefined(b, c, d)) {
      x = y = z = 0;
      r = a || 100;
    } else {
      x = a;
      y = b;
      z = c;
      r = d;
    }

    this.x = x;

    // TODO shouldn't this be set to y?
    this.y = x;

    // TODO shouldn't this be set to z?
    this.z = x;
    this.radius = r;
    this.the = this.phi = 0;
  }

  isSphereZone() {
    return true;
  }

  _dead(particle) {
    var d = particle.p.distanceTo(this);

    if (d - particle.radius > this.radius) particle.dead = true;
  }

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
    var d = particle.p.distanceTo(this);

    if (d + particle.radius >= this.radius) {
      normal
        .copy(particle.p)
        .sub(this)
        .normalize();
      v.copy(particle.v);
      k = 2 * v.dot(normal);
      particle.v.sub(normal.scalar(k));
    }
  };
})();
