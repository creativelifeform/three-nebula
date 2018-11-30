import { Euler, Vector3 } from 'three';

export default class Vector3D extends Vector3 {
  clear() {
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;

    return this;
  }

  scalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
  }

  addValue(a, b, c) {
    this.x += a;
    this.y += b;
    this.z += c;

    return this;
  }

  toString() {
    return 'x:' + this.x + 'y:' + this.y + 'z:' + this.z;
  }

  eulerFromDir(vector3D) {
    const euler = new Euler();

    return euler.setFromVector3(vector3D);
  }
}
