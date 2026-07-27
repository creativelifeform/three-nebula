import Span from './Span';
import sample from 'lodash/sample';
import { MATH_TYPE_ARRAY_SPAN as type } from './types';

/**
 * Class for storing items of a given type and fetching a randomised
 * value from them. `T` is the element type (e.g. a colour string, a Body).
 */
export default class ArraySpan<T = unknown> extends Span<T> {
  items: T[];

  constructor(items: T | T[]) {
    super();

    /**
     * @desc The class type.
     */
    this.type = type;

    /**
     * @desc The items to select from.
     */
    this.items = Array.isArray(items) ? items : [items];
  }

  /**
   * Gets a random item.
   */
  getValue(): T {
    return sample(this.items) as T;
  }
}

/**
 * Attempts to create an ArraySpan from the items provided.
 */
export const createArraySpan = <T>(
  items: T | T[] | ArraySpan<T>
): ArraySpan<T> | null => {
  if (!items) {
    return null;
  }

  if (items instanceof ArraySpan) {
    return items;
  }

  return new ArraySpan(items);
};
