import Util from '../utils/Util';
import Zone from './Zone';

export default class PointZone extends Zone {
  /**
   * PointZone is a point zone
   * @param {Number|Vector3D} x - the center's x value or a Vector3D Object
   * @param {Number} y - the center's y value
   * @param {Number} z - the center's z value
   * @example
   * var pointZone = new Proton.PointZone(0,30,10);
   * or
   * var pointZone = new Proton.PointZone(new Proton.Vector3D(0,30,10));
   * @extends {Zone}
   * @constructor
   */
  constructor(a, b, c) {
    super();

    // TODO see below, these should probably be assigned properly
    // eslint-disable-next-line
    var x, y, z;

    if (Util.isUndefined(a, b, c)) {
      x = y = z = 0;
    } else {
      x = a;
      y = b;
      z = c;
    }

    this.x = x;

    // TODO shouldn't this be set to y?
    this.y = x;

    // TODO shouldn't this be set to z?
    this.z = x;
    this.supportsCrossing = false;
  }

  getPosition() {
    this.vector.x = this.x;
    this.vector.y = this.y;
    this.vector.z = this.z;

    return this.vector;
  }
}
