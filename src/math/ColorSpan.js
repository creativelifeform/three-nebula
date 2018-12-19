import MathUtils from './MathUtils';
import Span from './Span';
import _ from 'lodash';

/**
 * Class for storing and interacting with an array of colours.
 *
 */
export default class ColorSpan extends Span {
  /**
   * Constructs a ColorSpan instance.
   *
   * @param {?array<string>} colors - An array of colors to select from,
   * if falsey, a random color will be returned from getValue
   * @return void
   */
  constructor(colors) {
    super();

    /**
     * @desc Determines if a random color should be returned from the getValue method.
     * @type {boolean}
     */
    this.shouldRandomize = !colors ? true : false;

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
    return this.shouldRandomize ? MathUtils.randomColor : _.sample(this.colors);
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
