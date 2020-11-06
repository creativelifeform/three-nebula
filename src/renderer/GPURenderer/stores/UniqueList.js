/**
 * Map of particle IDs to integer ids
 */

export class UniqueList
{
  constructor(max=Infinity) {
    this.max = max;
    this.count = 0;
    this._items = {};
  }

  add(item) {
    if (this._items[item] !== undefined)
      return;
    this._items[item] = this.count++;
  }
  find(item) {
    return this._items[item];
  }
}


