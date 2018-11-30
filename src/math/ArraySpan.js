import MathUtils from './MathUtils';
import Span from './Span';
import _ from 'lodash';

/**
 * Class for storing and interacting with an array of colours.
 *
 * NOTE Rename this to ColorSpan
 */
export default class ArraySpan extends Span {
  /**
   * Constructs an ArraySpan instance.
   *
   * @param {string|array} colors - single or multiple colors,
   * if the string 'random' is passed, a random color will be returned
   * from the getValue method
   * @return void
   */
  constructor(colors = 'random') {
    super();

    /**
     * @desc An array of colors
     * @type {array}
     */
    this._arr = Array.isArray(colors) ? colors : [colors];
  }

  /**
   * Gets a color from the color array.
   *
   * @return {string} a hex color
   */
  getValue() {
    const color = _.sample(this._arr);

    return this.isRandomColor(color) ? MathUtils.randomColor() : color;
  }

  /**
   * Determines if the color supplied is 'random'.
   *
   * @param {string} color - the color to check
   */
  isRandomColor(color) {
    return typeof color === 'string' && color.toLowerCase() === 'random';
  }
}

/**
 * Attempts to create an ArraySpan from the colors provided.
 *
 * @param {mixed} colors - colors to try and create an ArraySpan from
 * @return {?ArraySpan}
 */
export const createArraySpan = colors => {
  if (!colors) {
    return null;
  }

  if (colors instanceof ArraySpan) {
    return colors;
  }

  return new ArraySpan(colors);
};
