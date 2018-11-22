//@author mrdoob / http://mrdoob.com/

import { Vector3 } from 'three';

export default class Vector3D extends Vector3 {
  clear() {
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;

    return this;
  }

  toString() {
    return 'x:' + this.x + 'y:' + this.y + 'z:' + this.z;
  }
}
