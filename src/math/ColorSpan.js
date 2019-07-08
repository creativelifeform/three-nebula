import MathUtils from './MathUtils';
import Span from './Span';
import sample from 'lodash/sample';
import { MATH_TYPE_COLOR_SPAN as type } from './types';

/**
 * Class for storing and interacting with an array of colours.
 *
 */
export default class ColorSpan extends Span {
  /**
   * Constructs a ColorSpan instance.
   *
   * @param {string|array<string>} colors - A color or array of colors. If the
   * string 'random' is provided, a random color will be returned from getValue
   * @return void
   */
  constructor(colors) {
    super();

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;

    /**
     * @desc Determines if a random color should be returned from the getValue method.
     * @type {boolean}
     */
    this.shouldRandomize = colors === 'random' ? true : false;

    /**
     * @desc An array of colors to select from
     * @type {array<string>}
     */
    this.colors = Array.isArray(colors) ? colors : [colors];
  }

  /**
   * Gets a color from the color array
   * or a random color if this.shouldRandomize is true.
   *
   * @return {string} a hex color
   */
  getValue() {
    return this.shouldRandomize ? MathUtils.randomColor() : sample(this.colors);
  }
}

/**
 * Attempts to create an ArraySpan from the colors provided.
 *
 * @param {mixed} colors - colors to try and create an ArraySpan from
 * @return {?ColorSpan}
 */
export const createColorSpan = colors => {
  if (!colors) {
    return null;
  }

  if (colors instanceof ColorSpan) {
    return colors;
  }

  return new ColorSpan(colors);
};
