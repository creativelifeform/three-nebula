/**
 * Map of particle IDs to integer ids
 */
export class UniqueList {
  max: number;
  count: number;
  _items: Record<string, number>;

  constructor(max: number = Infinity) {
    this.max = max;
    this.count = 0;
    this._items = {};
  }

  add(item: string | number): void {
    if (this._items[item] !== undefined) {
      return;
    }

    this._items[item] = this.count++;
  }

  // Callers only ever query ids that were previously `add`ed (the renderers add
  // a particle's id on creation before ever looking it up), so the lookup is
  // effectively total; the declared `number` return reflects that invariant.
  find(item: string | number): number {
    return this._items[item];
  }

  destroy(): void {
    this._items = {};
    this.count = 0;
  }
}
