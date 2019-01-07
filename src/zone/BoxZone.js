import MathUtils from '../math/MathUtils';
import Util from '../utils/Util';
import Zone from './Zone';
import { ZONE_TYPE_BOX as type } from './types';

export default class BoxZone extends Zone {
  /**
   * BoxZone is a box zone
   * @param {Number|Vector3D} x - the position's x value or a Vector3D Object
   * @param {Number} y - the position's y value
   * @param {Number} z - the position's z value
   * @param {Number} w - the Box's width
   * @param {Number} h - the Box's height
   * @param {Number} d - the Box's depth
   * @example
   * var boxZone = new BoxZone(0,0,0,50,50,50);
   * or
   * var boxZone = new BoxZone(new Vector3D(0,0,0), 50, 50, 50);
   * @extends {Zone}
   * @constructor
   */
  constructor(a, b, c, d, e, f) {
    super(type);

    // TODO this reassigning of arguments is pretty dangerous, need to fix it.
    // eslint-disable-next-line
    var x, y, z, w, h, d;

    if (Util.isUndefined(b, c, d, e, f)) {
      x = y = z = 0;
      w = h = d = a || 100;
    } else if (Util.isUndefined(d, e, f)) {
      x = y = z = 0;
      w = a;
      h = b;
      d = c;
    } else {
      x = a;
      y = b;
      z = c;
      w = d;
      h = e;
      d = f;
    }

    this.x = x;
    this.y = y;
    this.z = z;
    this.width = w;
    this.height = h;
    this.depth = d;
    // TODO Set this via an argument to the constructor
    this.friction = 0.85;
    // TODO Set this via an argument to the constructor
    this.max = 6;
  }

  /**
   * Returns true to indicate this is a BoxZone.
   *
   * @return {boolean}
   */
  isBoxZone() {
    return true;
  }

  getPosition() {
    this.vector.x = this.x + MathUtils.randomAToB(-0.5, 0.5) * this.width;
    this.vector.y = this.y + MathUtils.randomAToB(-0.5, 0.5) * this.height;
    this.vector.z = this.z + MathUtils.randomAToB(-0.5, 0.5) * this.depth;

    return this.vector;
  }

  _dead(particle) {
    if (particle.position.x + particle.radius < this.x - this.width / 2)
      particle.dead = true;
    else if (particle.position.x - particle.radius > this.x + this.width / 2)
      particle.dead = true;

    if (particle.position.y + particle.radius < this.y - this.height / 2)
      particle.dead = true;
    else if (particle.position.y - particle.radius > this.y + this.height / 2)
      particle.dead = true;

    if (particle.position.z + particle.radius < this.z - this.depth / 2)
      particle.dead = true;
    else if (particle.position.z - particle.radius > this.z + this.depth / 2)
      particle.dead = true;
  }

  _bound(particle) {
    if (particle.position.x - particle.radius < this.x - this.width / 2) {
      particle.position.x = this.x - this.width / 2 + particle.radius;
      particle.velocity.x *= -this.friction;
      this._static(particle, 'x');
    } else if (particle.position.x + particle.radius > this.x + this.width / 2) {
      particle.position.x = this.x + this.width / 2 - particle.radius;
      particle.velocity.x *= -this.friction;
      this._static(particle, 'x');
    }

    if (particle.position.y - particle.radius < this.y - this.height / 2) {
      particle.position.y = this.y - this.height / 2 + particle.radius;
      particle.velocity.y *= -this.friction;
      this._static(particle, 'y');
    } else if (particle.position.y + particle.radius > this.y + this.height / 2) {
      particle.position.y = this.y + this.height / 2 - particle.radius;
      particle.velocity.y *= -this.friction;
      this._static(particle, 'y');
    }

    if (particle.position.z - particle.radius < this.z - this.depth / 2) {
      particle.position.z = this.z - this.depth / 2 + particle.radius;
      particle.velocity.z *= -this.friction;
      this._static(particle, 'z');
    } else if (particle.position.z + particle.radius > this.z + this.depth / 2) {
      particle.position.z = this.z + this.depth / 2 - particle.radius;
      particle.velocity.z *= -this.friction;
      this._static(particle, 'z');
    }
  }

  _static(particle, axis) {
    if (particle.velocity[axis] * particle.acceleration[axis] > 0) return;
    if (
      Math.abs(particle.velocity[axis]) <
      Math.abs(particle.acceleration[axis]) * 0.0167 * this.max
    ) {
      particle.velocity[axis] = 0;
      particle.acceleration[axis] = 0;
    }
  }

  _cross(particle) {
    if (
      particle.position.x + particle.radius < this.x - this.width / 2 &&
      particle.velocity.x <= 0
    )
      particle.position.x = this.x + this.width / 2 + particle.radius;
    else if (
      particle.position.x - particle.radius > this.x + this.width / 2 &&
      particle.velocity.x >= 0
    )
      particle.position.x = this.x - this.width / 2 - particle.radius;

    if (
      particle.position.y + particle.radius < this.y - this.height / 2 &&
      particle.velocity.y <= 0
    )
      particle.position.y = this.y + this.height / 2 + particle.radius;
    else if (
      particle.position.y - particle.radius > this.y + this.height / 2 &&
      particle.velocity.y >= 0
    )
      particle.position.y = this.y - this.height / 2 - particle.radius;

    if (
      particle.position.z + particle.radius < this.z - this.depth / 2 &&
      particle.velocity.z <= 0
    )
      particle.position.z = this.z + this.depth / 2 + particle.radius;
    else if (
      particle.position.z - particle.radius > this.z + this.depth / 2 &&
      particle.velocity.z >= 0
    )
      particle.position.z = this.z - this.depth / 2 - particle.radius;
  }
}
