import { PI } from '../constants';

/**
 * The vector surface these helpers operate on. Ideally this would be
 * `Vector3D`, but `Vector3D extends` the vendored `core/three/Vector3`, which is
 * written with prototype assignment (`Object.assign(Vector3.prototype, …)`) that
 * TypeScript cannot infer — so its inherited methods aren't visible on the type
 * yet. Replace with `Vector3D` once `core/three` is typed (see spec 06, Stage 0).
 */
interface VectorLike {
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): VectorLike;
  normalize(): VectorLike;
  copy(v: VectorLike): VectorLike;
  cross(v: VectorLike): VectorLike;
  dot(v: VectorLike): number;
  scalar(s: number): VectorLike;
  addValue(a: number, b: number, c: number): VectorLike;
}

export default {
  randomAToB: function(a: number, b: number, INT?: boolean): number {
    if (!INT) return a + Math.random() * (b - a);
    else return ((Math.random() * (b - a)) >> 0) + a;
  },
  randomFloating: function(center: number, f: number, INT?: boolean): number {
    return this.randomAToB(center - f, center + f, INT);
  },

  randomZone: function(display?: unknown): void {}, //eslint-disable-line

  degreeTransform: function(a: number): number {
    return (a * PI) / 180;
  },

  toColor16: function getRGB(num: number): string {
    return '#' + num.toString(16);
  },

  randomColor: function(): string {
    return (
      '#' +
      ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).slice(-6)
    );
  },

  lerp: function(a: number, b: number, energy: number): number {
    return b + (a - b) * energy;
  },

  getNormal: function(v: VectorLike, n: VectorLike): VectorLike {
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
  axisRotate: function(
    v0: VectorLike,
    v: VectorLike,
    k: VectorLike,
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
