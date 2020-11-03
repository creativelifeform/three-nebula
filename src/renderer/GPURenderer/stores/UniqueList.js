/**
 * Map of particle IDs to integer ids
 */

export class UniqueList { 
  constructor(max = Infinity) {
    this.max = max;
    this.count=0;
    this._items = {};
  }
  add(item) {
    if (this._items[item]!==undefined)
        return;
    this._items[item]=this.count++;
  }
  find(item) {
    return this._items[item];
  }
}

/*

export class UniqueList {
    
  constructor(max = Infinity) {
    this.max = max;

    this._items = [];
  }

  add(item) {
    if (this.has(item)) {
      return;
    }

    if (this._items.length + 1 === this.max) {
     throw new Error('UniqueList max size exceeded');
    }

    this._items.push(item);
  }

  has(item) {
    return this._items.indexOf(item) > 0;
  }

  find(item) {
    return this._items.indexOf(item);
  }
}
*/