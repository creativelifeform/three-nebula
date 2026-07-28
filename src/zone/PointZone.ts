import Util from '../utils/Util';
import Zone from './Zone';
import type Vector3D from '../math/Vector3D';
import { ZONE_TYPE_POINT as type } from './types';

export default class PointZone extends Zone {
  x: number;
  y: number;
  z: number;

  /**
   * PointZone is a point zone.
   */
  constructor(a?: number, b?: number, c?: number) {
    super(type);

    let x = 0;

    if (!Util.isUndefined(a, b, c)) {
      x = a as number;
    }

    this.x = x;

    // TODO shouldn't this be set to y?
    this.y = x;

    // TODO shouldn't this be set to z?
    this.z = x;
    this.supportsCrossing = false;
  }

  isPointZone(): boolean {
    return true;
  }

  getPosition(): Vector3D {
    this.vector.x = this.x;
    this.vector.y = this.y;
    this.vector.z = this.z;

    return this.vector;
  }
}
