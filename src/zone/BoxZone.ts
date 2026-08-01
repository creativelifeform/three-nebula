import MathUtils from '../math/MathUtils';
import Util from '../utils/Util';
import Zone from './Zone';
import type Vector3D from '../math/Vector3D';
import type Particle from '../core/Particle';
import { ZONE_TYPE_BOX as type } from './types';

type Axis = 'x' | 'y' | 'z';

export default class BoxZone extends Zone {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  friction: number;
  max: number;

  /**
   * BoxZone is a box zone.
   */
  constructor(
    a?: number,
    b?: number,
    c?: number,
    d?: number,
    e?: number,
    f?: number
  ) {
    super(type);

    // `d` is the constructor parameter (reused below); the other locals default
    // to undefined and are assigned per the argument pattern.
    // eslint-disable-next-line
    var x, y, z, w, h;

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

    this.x = x as number;
    this.y = y as number;
    this.z = z as number;
    this.width = w as number;
    this.height = h as number;
    this.depth = d as number;
    this.friction = 0.85;
    this.max = 6;
  }

  isBoxZone(): boolean {
    return true;
  }

  getPosition(): Vector3D {
    this.vector.x = this.x + MathUtils.randomAToB(-0.5, 0.5) * this.width;
    this.vector.y = this.y + MathUtils.randomAToB(-0.5, 0.5) * this.height;
    this.vector.z = this.z + MathUtils.randomAToB(-0.5, 0.5) * this.depth;

    return this.vector;
  }

  _dead(particle: Particle): void {
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

  _bound(particle: Particle): void {
    if (particle.position.x - particle.radius < this.x - this.width / 2) {
      particle.position.x = this.x - this.width / 2 + particle.radius;
      particle.velocity.x *= -this.friction;
      this._static(particle, 'x');
    } else if (
      particle.position.x + particle.radius >
      this.x + this.width / 2
    ) {
      particle.position.x = this.x + this.width / 2 - particle.radius;
      particle.velocity.x *= -this.friction;
      this._static(particle, 'x');
    }

    if (particle.position.y - particle.radius < this.y - this.height / 2) {
      particle.position.y = this.y - this.height / 2 + particle.radius;
      particle.velocity.y *= -this.friction;
      this._static(particle, 'y');
    } else if (
      particle.position.y + particle.radius >
      this.y + this.height / 2
    ) {
      particle.position.y = this.y + this.height / 2 - particle.radius;
      particle.velocity.y *= -this.friction;
      this._static(particle, 'y');
    }

    if (particle.position.z - particle.radius < this.z - this.depth / 2) {
      particle.position.z = this.z - this.depth / 2 + particle.radius;
      particle.velocity.z *= -this.friction;
      this._static(particle, 'z');
    } else if (
      particle.position.z + particle.radius >
      this.z + this.depth / 2
    ) {
      particle.position.z = this.z + this.depth / 2 - particle.radius;
      particle.velocity.z *= -this.friction;
      this._static(particle, 'z');
    }
  }

  _static(particle: Particle, axis: Axis): void {
    if (particle.velocity[axis] * particle.acceleration[axis] > 0) return;
    if (
      Math.abs(particle.velocity[axis]) <
      Math.abs(particle.acceleration[axis]) * 0.0167 * this.max
    ) {
      particle.velocity[axis] = 0;
      particle.acceleration[axis] = 0;
    }
  }

  _cross(particle: Particle): void {
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
