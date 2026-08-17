import Span from './Span';
import type { RNG } from './rng';
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
   * Gets a random item, using the supplied seeded `rng` when provided (falls
   * back to Math.random). Replaces lodash `sample`, which drew from the global
   * Math.random and could not be seeded.
   */
  getValue(_INT?: boolean, rng?: RNG): T {
    const rand = rng ?? Math.random;

    return this.items[(rand() * this.items.length) >> 0];
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
