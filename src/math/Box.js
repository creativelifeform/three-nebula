import { MATH_TYPE_BOX as type } from './types';

export default class Box {
  constructor(x, y, z, w, h, d) {
    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = w;
    this.height = h;
    this.depth = d;
    this.bottom = this.y + this.height;
    this.right = this.x + this.width;
    this.right = this.x + this.width;
  }

  contains(x, y, z) {
    if (
      x <= this.right &&
      x >= this.x &&
      y <= this.bottom &&
      y >= this.y &&
      z <= this.depth &&
      z >= this.z
    )
      return true;
    else return false;
  }
}
