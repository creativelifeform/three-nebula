import { Euler, Vector3 } from '../core/three';

export default class Vector3D extends Vector3 {
  clear(): this {
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;

    return this;
  }

  scalar(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
  }

  addValue(a: number, b: number, c: number): this {
    this.x += a;
    this.y += b;
    this.z += c;

    return this;
  }

  toString(): string {
    return 'x:' + this.x + 'y:' + this.y + 'z:' + this.z;
  }

  eulerFromDir(vector3D: Vector3): Euler {
    const euler = new Euler();

    return euler.setFromVector3(vector3D);
  }
}
