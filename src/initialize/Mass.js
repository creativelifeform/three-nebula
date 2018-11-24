import Initialize from './Initialize';
import { createSpan } from '../math';

export default class Mass extends Initialize {
  /**
   * Mass is init particle's Mass
   * @param {Number} a - the Mass's start point
   * @param {Number} b - the Mass's end point
   * @param {String} c - span's center
   * @example
   * var Mass = new Proton.Mass(3,5);
   * or
   * var Mass = new Proton.Mass(Infinity);
   * @extends {Initialize}
   * @constructor
   */
  constructor(a, b, c) {
    super();
    this.massPan = createSpan(a, b, c);
  }

  initialize(target) {
    target.mass = this.massPan.getValue();
  }
}
