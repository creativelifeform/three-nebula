import Initialize from './Initialize';
import { createSpan } from '../math';

export default class Life extends Initialize {
  /**
   * Life is init particle's Life
   * @param {Number} a - the Life's start point
   * @param {Number} b - the Life's end point
   * @param {String} c - span's center
   * @example
   * var life = new Proton.Life(3,5);
   * or
   * var life = new Proton.Life(Infinity);
   * @extends {Initialize}
   * @constructor
   */
  constructor(a, b, c) {
    super();
    this.lifePan = createSpan(a, b, c);
  }

  initialize(target) {
    if (this.lifePan.a == Infinity || this.lifePan.a == 'infi')
      target.life = Infinity;
    else target.life = this.lifePan.getValue();
  }
}
