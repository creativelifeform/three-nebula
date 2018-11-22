import MathUtils from './MathUtils';
import Span from './Span';
import Util from '../utils/Util';

export default class ArraySpan extends Span {
  /**
   * ArraySpan name get a random Color from a colors array
   * @param {String|Array} colors - colors array
   * @example
   * var span = new ArraySpan(["#fff","#ff0","#000"]);
   * or
   * var span = new ArraySpan("#ff0");
   * @extends {Span}
   * @constructor
   */

  constructor(colors) {
    super();

    this._arr = Util.isArray(colors) ? colors : [colors];
  }

  /**
   * getValue function
   * @name get a random Color
   * @return {string} a hex color
   */
  getValue() {
    var color = this._arr[(this._arr.length * Math.random()) >> 0];

    if (color == 'random' || color == 'Random') return MathUtils.randomColor();
    else return color;
  }
}

/**
 * createArraySpan function
 * @name get a instance of Span
 * @param {number} a min number
 * @param {number} b max number
 * @param {number} c center number
 * @return {number} return a instance of Span
 */
export const createArraySpan = arr => {
  if (!arr) return null;
  if (arr instanceof ArraySpan) return arr;
  else return new ArraySpan(arr);
};
