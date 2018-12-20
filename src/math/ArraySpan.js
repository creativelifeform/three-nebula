import Span from './Span';
import _ from 'lodash';
import { MATH_TYPE_ARRAY_SPAN as type } from './types';

/**
 * Class for storing items of mixed type and fetching a randomised
 * value from these items.
 *
 */
export default class ArraySpan extends Span {
  /**
   * Constructs an ArraySpan instance.
   *
   * @param {mixed|array<mixed>} items - Items
   * @return void
   */
  constructor(items) {
    super();

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;

    /**
     * @desc An array of colors
     * @type {array}
     */
    this.items = Array.isArray(items) ? items : [items];
  }

  /**
   * Gets a random item.
   *
   * @return {mixed}
   */
  getValue() {
    return _.sample(this.items);
  }
}

/**
 * Attempts to create an ArraySpan from the items provided.
 *
 * @param {mixed} items - Items to try and create an ArraySpan from
 * @return {?ArraySpan}
 */
export const createArraySpan = items => {
  if (!items) {
    return null;
  }

  if (items instanceof ArraySpan) {
    return items;
  }

  return new ArraySpan(items);
};
