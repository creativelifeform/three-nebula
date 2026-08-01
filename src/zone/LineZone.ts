import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import { ZONE_TYPE_LINE as type } from './types';

export default class LineZone extends Zone {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;

  /**
   * LineZone is a 3d line zone.
   */
  constructor(
    x1?: number | Vector3D,
    y1?: number,
    z1?: number,
    x2?: number | Vector3D,
    y2?: number,
    z2?: number
  ) {
    super(type);

    if (x1 instanceof Vector3D) {
      const p2 = x2 as Vector3D;

      this.x1 = x1.x;
      this.y1 = x1.y;
      this.z1 = x1.z;

      this.x2 = p2.x;
      this.y2 = p2.y;
      this.z2 = p2.z;
    } else {
      this.x1 = x1 as number;
      this.y1 = y1 as number;
      this.z1 = z1 as number;

      this.x2 = x2 as number;
      this.y2 = y2 as number;
      this.z2 = z2 as number;
    }

    this.supportsCrossing = false;
  }

  isLineZone(): boolean {
    return true;
  }

  getPosition(): Vector3D {
    this.random = Math.random();
    this.vector.x = this.x1 + this.random * (this.x2 - this.x1);
    this.vector.y = this.y1 + this.random * (this.y2 - this.y1);
    this.vector.z = this.z1 + this.random * (this.z2 - this.z1);

    return this.vector;
  }
}
