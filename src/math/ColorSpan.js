import MathUtils from './MathUtils';
import Span from './Span';
import _ from 'lodash';

/**
 * Class for storing and interacting with an array of colours.
 *
 */
export default class ColorSpan extends Span {
  /**
   * Constructs an ArraySpan instance.
   *
   * @param {string|array} colors - An array of colors to select from
   * @param {boolean} shouldRandomize - Determines if a random color should be returned from the getValue method
   * @return void
   */
  constructor(colors, shouldRandomize = false) {
    super();

    /**
     * @desc Determines if a random color should be returned from the getValue method.
     * @type {boolean}
     */
    this.shouldRandomize = shouldRandomize;

    /**
     * @desc An array of colors to select from
     * @type {array}
     */
    this.colors = Array.isArray(colors) ? colors : [colors];
  }

  /**
   * Gets a color from the color array.
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
 * @return {?ArraySpan}
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
