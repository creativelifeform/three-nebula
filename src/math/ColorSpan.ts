import MathUtils from './MathUtils';
import Span from './Span';
import sample from 'lodash/sample';
import { MATH_TYPE_COLOR_SPAN as type } from './types';

/**
 * Class for storing and interacting with an array of colours.
 */
export default class ColorSpan extends Span<string> {
  shouldRandomize: boolean;
  colors: string[];

  /**
   * Constructs a ColorSpan instance.
   *
   * @param colors - A color or array of colors. If the string 'random' is
   * provided, a random color will be returned from getValue.
   */
  constructor(colors: string | string[]) {
    super();

    /**
     * @desc The class type.
     */
    this.type = type;

    /**
     * @desc Determines if a random color should be returned from getValue.
     */
    this.shouldRandomize = colors === 'random' ? true : false;

    /**
     * @desc An array of colors to select from.
     */
    this.colors = Array.isArray(colors) ? colors : [colors];
  }

  /**
   * Gets a color from the color array, or a random color if shouldRandomize.
   */
  getValue(): string {
    return this.shouldRandomize
      ? MathUtils.randomColor()
      : (sample(this.colors) as string);
  }
}

/**
 * Attempts to create a ColorSpan from the colors provided.
 */
export const createColorSpan = (
  colors: string | string[] | ColorSpan
): ColorSpan => {
  if (!colors) {
    console.warn(
      `Invalid colors argument ${colors} passed to createColorSpan. Defaulting to 'random'.`
    );

    colors = 'random';
  }

  if (colors instanceof ColorSpan) {
    return colors;
  }

  return new ColorSpan(colors);
};
