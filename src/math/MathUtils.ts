import { PI } from '../constants';
import type Vector3D from './Vector3D';
import type { RNG } from './rng';

export default {
  // `rng` is optional with a Math.random fallback: the engine passes its seeded
  // stream (deterministic); callers that pass nothing behave exactly as before.
  randomAToB: function (
    a: number,
    b: number,
    INT?: boolean,
    rng?: RNG
  ): number {
    const rand = rng ?? Math.random;

    if (!INT) return a + rand() * (b - a);
    else return ((rand() * (b - a)) >> 0) + a;
  },
  randomFloating: function (
    center: number,
    f: number,
    INT?: boolean,
    rng?: RNG
  ): number {
    return this.randomAToB(center - f, center + f, INT, rng);
  },

  randomZone: function (display?: unknown): void {}, //eslint-disable-line

  degreeTransform: function (a: number): number {
    return (a * PI) / 180;
  },

  toColor16: function getRGB(num: number): string {
    return '#' + num.toString(16);
  },

  randomColor: function (rng?: RNG): string {
    const rand = rng ?? Math.random;

    return '#' + ('00000' + ((rand() * 0x1000000) << 0).toString(16)).slice(-6);
  },

  lerp: function (a: number, b: number, energy: number): number {
    return b + (a - b) * energy;
  },

  getNormal: function (v: Vector3D, n: Vector3D): Vector3D {
    if (v.x == 0 && v.y == 0) {
      if (v.z == 0) n.set(1, 0, 1);
      else n.set(1, 1, -v.y / v.z);
    } else {
      if (v.x == 0) n.set(1, 0, 1);
      else n.set(-v.y / v.x, 1, 1);
    }

    return n.normalize();
  },

  /**
   * Rodrigues' Rotation Formula
   * https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
   * v′ = vcos(θ) + k(k⋅v)(1−cos(θ)) + (k*v)sin(θ)
   */
  axisRotate: function (
    v0: Vector3D,
    v: Vector3D,
    k: Vector3D,
    tha: number
  ): void {
    var cos = Math.cos(tha);
    var sin = Math.sin(tha);
    var p = k.dot(v) * (1 - cos);

    v0.copy(k);
    v0.cross(v).scalar(sin);
    v0.addValue(v.x * cos, v.y * cos, v.z * cos);
    v0.addValue(k.x * p, k.y * p, k.z * p);
  },
};
