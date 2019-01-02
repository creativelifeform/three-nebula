import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import { ZONE_TYPE_LINE as type } from './types';

export default class LineZone extends Zone {
  /**
   * LineZone is a 3d line zone
   * @param {Number|Vector3D} x1 - the line's start point of x value or a Vector3D Object
   * @param {Number|Vector3D} y1 - the line's start point of y value or a Vector3D Object
   * @param {Number} z1 - the line's start point of z value
   * @param {Number} x2 - the line's end point of x value
   * @param {Number} y2 - the line's end point of y value
   * @param {Number} z2 - the line's end point of z value
   * @example
   * var lineZone = new Proton.LineZone(0,0,0,100,100,0);
   * or
   * var lineZone = new Proton.LineZone(new Proton.Vector3D(0,0,0),new Proton.Vector3D(100,100,0));
   * @extends {Zone}
   * @constructor
   */
  constructor(x1, y1, z1, x2, y2, z2) {
    super(type);

    if (x1 instanceof Vector3D) {
      this.x1 = x1.x;
      this.y1 = x1.y;
      this.z1 = x1.z;

      this.x2 = x2.x;
      this.y2 = x2.y;
      this.z2 = x2.z;
    } else {
      this.x1 = x1;
      this.y1 = y1;
      this.z1 = z1;

      this.x2 = x2;
      this.y2 = y2;
      this.z2 = z2;
    }

    this.supportsCrossing = false;
  }

  /**
   * Returns true to indicate this is a LineZone.
   *
   * @return {boolean}
   */
  isLineZone() {
    return true;
  }

  getPosition() {
    this.random = Math.random();
    this.vector.x = this.x1 + this.random * (this.x2 - this.x1);
    this.vector.y = this.y1 + this.random * (this.y2 - this.y1);
    this.vector.z = this.z1 + this.random * (this.z2 - this.z1);

    return this.vector;
  }
}
