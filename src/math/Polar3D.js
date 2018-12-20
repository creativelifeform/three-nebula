import Vector3D from './Vector3D';
import { MATH_TYPE_POLAR_3D as type } from './types';

export default class Polar3D {
  constructor(radius, theta, phi) {
    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    this.radius = radius || 1;
    this.phi = phi || 0;
    this.theta = theta || 0;
  }

  set(radius, theta, phi) {
    this.radius = radius || 1;
    this.phi = phi || 0;
    this.theta = theta || 0;

    return this;
  }

  setRadius(radius) {
    this.radius = radius;

    return this;
  }

  setPhi(phi) {
    this.phi = phi;

    return this;
  }

  setTheta(theta) {
    this.theta = theta;

    return this;
  }

  copy(p) {
    this.radius = p.radius;
    this.phi = p.phi;
    this.theta = p.theta;

    return this;
  }

  toVector3D() {
    return new Vector3D(this.getX(), this.getY(), this.getZ());
  }

  getX() {
    return this.radius * Math.sin(this.theta) * Math.cos(this.phi);
  }

  getY() {
    return -this.radius * Math.sin(this.theta) * Math.sin(this.phi);
  }

  getZ() {
    return this.radius * Math.cos(this.theta);
  }

  normalize() {
    this.radius = 1;

    return this;
  }

  equals(v) {
    return (
      v.radius === this.radius && v.phi === this.phi && v.theta === this.theta
    );
  }

  clear() {
    this.radius = 0.0;
    this.phi = 0.0;
    this.theta = 0.0;

    return this;
  }

  clone() {
    return new Polar3D(this.radius, this.phi, this.theta);
  }
}
