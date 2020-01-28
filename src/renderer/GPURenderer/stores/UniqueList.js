/**
 * Similar to a Set but with a find method.
 *
 */
export class UniqueList {
  constructor(max = Infinity) {
    this.max = max;
    this.items = [];
  }

  add(item) {
    if (this.has(item)) {
      return;
    }

    if (this.items.length + 1 === this.max) {
      throw new Error('UniqueList max size exceeded');
    }

    this.items.push(item);
  }

  has(item) {
    return this.items.indexOf(item) > 0;
  }

  find(item) {
    return this.items.indexOf(item);
  }
}
