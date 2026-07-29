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

  find(item: string | number): number {
    return this._items[item];
  }

  destroy(): void {
    this._items = {};
    this.count = 0;
  }
}
