import Vector3D from './Vector3D';
import { MATH_TYPE_POLAR_3D as type } from './types';

export default class Polar3D {
  type: string;
  radius: number;
  phi: number;
  theta: number;

  constructor(radius?: number, theta?: number, phi?: number) {
    /**
     * @desc The class type.
     */
    this.type = type;
    this.radius = radius || 1;
    this.phi = phi || 0;
    this.theta = theta || 0;
  }

  set(radius?: number, theta?: number, phi?: number): this {
    this.radius = radius || 1;
    this.phi = phi || 0;
    this.theta = theta || 0;

    return this;
  }

  setRadius(radius: number): this {
    this.radius = radius;

    return this;
  }

  setPhi(phi: number): this {
    this.phi = phi;

    return this;
  }

  setTheta(theta: number): this {
    this.theta = theta;

    return this;
  }

  copy(p: Polar3D): this {
    this.radius = p.radius;
    this.phi = p.phi;
    this.theta = p.theta;

    return this;
  }

  toVector3D(): Vector3D {
    return new Vector3D(this.getX(), this.getY(), this.getZ());
  }

  getX(): number {
    return this.radius * Math.sin(this.theta) * Math.cos(this.phi);
  }

  getY(): number {
    return -this.radius * Math.sin(this.theta) * Math.sin(this.phi);
  }

  getZ(): number {
    return this.radius * Math.cos(this.theta);
  }

  normalize(): this {
    this.radius = 1;

    return this;
  }

  equals(v: Polar3D): boolean {
    return (
      v.radius === this.radius && v.phi === this.phi && v.theta === this.theta
    );
  }

  clear(): this {
    this.radius = 0.0;
    this.phi = 0.0;
    this.theta = 0.0;

    return this;
  }

  clone(): Polar3D {
    return new Polar3D(this.radius, this.phi, this.theta);
  }
}
