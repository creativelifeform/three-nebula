import MathUtils from './MathUtils';
import Util from '../utils/Util';
import { MATH_TYPE_SPAN as type } from './types';
import type { RNG } from './rng';

export default class Span<T = number> {
  _isArray: boolean;
  type: string;
  a: number | T[];
  b: number;
  _center: number | boolean;

  /**
   * Span Class. Get a random Number from a to b. Or from c-a to c+b
   *
   * @example
   * var span = new Span(0,30);
   * or
   * var span = new Span(["#fff","#ff0","#000"]);
   * or
   * var span = new Span(5,1,"center");
   */
  constructor(a?: number | T[] | null, b?: number, center?: number | boolean) {
    this._isArray = false;

    /**
     * @desc The class type.
     */
    this.type = type;

    if (Util.isArray(a)) {
      this._isArray = true;
      this.a = a as T[];
    } else {
      this.a = Util.initValue(a, 1);
      this.b = Util.initValue(b, this.a);
      this._center = Util.initValue(center, false);
    }
  }

  /**
   * Get a random value from a to b, or from c-a to c+b, or a random member of
   * the array form.
   */
  getValue(INT?: boolean, rng?: RNG): T {
    if (this._isArray) {
      const arr = this.a as T[];
      const rand = rng ?? Math.random;

      return arr[(arr.length * rand()) >> 0];
    } else {
      const a = this.a as number;
      const value = !this._center
        ? MathUtils.randomAToB(a, this.b, INT, rng)
        : MathUtils.randomFloating(a, this.b, INT, rng);

      return value as T;
    }
  }

  /**
   * Draws a value from this span (the common non-integer case), using the
   * supplied seeded `rng` when provided and falling back to `Math.random`
   * otherwise. Sugar for `getValue(false, rng)`; prefer this over
   * `getValue(undefined, rng)` when threading a seeded stream. Inherited by
   * ArraySpan/ColorSpan, where it returns a random element.
   */
  sample(rng?: RNG): T {
    return this.getValue(false, rng);
  }
}

export const createSpan = (
  a: number | number[] | Span | null | undefined,
  b?: number,
  c?: number | boolean
): Span => {
  if (a instanceof Span) return a;

  if (b === undefined) {
    return new Span(a);
  } else {
    if (c === undefined) return new Span(a, b);
    else return new Span(a, b, c);
  }
};
