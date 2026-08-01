import { MATH_TYPE_BOX as type } from './types';

export default class Box {
  type: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  bottom: number;
  right: number;

  constructor(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number
  ) {
    /**
     * @desc The class type.
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
  }

  contains(x: number, y: number, z: number): boolean {
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
