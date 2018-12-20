import MathUtils from './MathUtils';
import Util from '../utils/Util';
import { MATH_TYPE_SPAN as type } from './types';

export default class Span {
  /**
   * Span Class. Get a random Number from a to b. Or from c-a to c+b
   * @param {Number|Array} a - min number
   * @param {Number} b - max number
   * @param {Number} center - the center's z value
   * @example
   * var span = new Span(0,30);
   * or
   * var span = new Span(["#fff","#ff0","#000"]);
   * or
   * var span = new Span(5,1,"center");
   * @extends {Zone}
   * @constructor
   */
  constructor(a, b, center) {
    this._isArray = false;

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;

    if (Util.isArray(a)) {
      this._isArray = true;
      this.a = a;
    } else {
      this.a = Util.initValue(a, 1);
      this.b = Util.initValue(b, this.a);
      this._center = Util.initValue(center, false);
    }
  }

  /**
   * Span.getValue function
   * @name get a random Number from a to b. Or get a random Number from c-a to c+b
   * @param {number} INT or int
   * @return {number} a random Number
   */
  getValue(INT) {
    if (this._isArray) {
      return this.a[(this.a.length * Math.random()) >> 0];
    } else {
      if (!this._center) return MathUtils.randomAToB(this.a, this.b, INT);
      else return MathUtils.randomFloating(this.a, this.b, INT);
    }
  }
}

export const createSpan = (a, b, c) => {
  if (a instanceof Span) return a;

  if (b === undefined) {
    return new Span(a);
  } else {
    if (c === undefined) return new Span(a, b);
    else return new Span(a, b, c);
  }
};
