//@author mrdoob / http://mrdoob.com/

import Quaternion from './Quaternion';
import { Vector3 } from 'three';

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

  toString() {
    return 'x:' + this.x + 'y:' + this.y + 'z:' + this.z;
  }
}

Vector3D.prototype.applyEuler = (function() {
  let quaternion;

  return function applyEuler(euler) {
    if (quaternion === undefined) quaternion = new Quaternion();
    this.applyQuaternion(quaternion.setFromEuler(euler));

    return this;
  };
})();

Vector3D.prototype.applyAxisAngle = (function() {
  let quaternion;

  return function applyAxisAngle(axis, angle) {
    if (quaternion === undefined) quaternion = new Quaternion();
    this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));

    return this;
  };
})();
