/**
 * Map of particle IDs to integer buffer-slot indices.
 *
 * The slot returned by `find` indexes a fixed-size render buffer, so the slot
 * space must stay bounded by the number of *live* particles — not the total
 * ever spawned. Freed slots (see `remove`) are recycled ahead of minting new
 * ones, which keeps `count` at the live high-water mark. Without recycling,
 * per-spawn ids (deterministic ids reassign on every pool reuse) would grow
 * `count` without bound and eventually push slots past the buffer's capacity,
 * silently dropping particles from the render.
 */
export class UniqueList {
  max: number;
  count: number;
  _items: Record<string, number>;
  _freeSlots: number[];

  constructor(max: number = Infinity) {
    this.max = max;
    this.count = 0;
    this._items = {};
    this._freeSlots = [];
  }

  add(item: string | number): void {
    if (this._items[item] !== undefined) {
      return;
    }

    // Reuse a released slot when one is available so the index space is bounded
    // by concurrent live particles rather than cumulative spawns.
    this._items[item] =
      this._freeSlots.length > 0
        ? (this._freeSlots.pop() as number)
        : this.count++;
  }

  // Callers only ever query ids that were previously `add`ed (the renderers add
  // a particle's id on creation before ever looking it up), so the lookup is
  // effectively total; the declared `number` return reflects that invariant.
  find(item: string | number): number {
    return this._items[item];
  }

  // Releases an item's slot back to the free list so a subsequent `add` can
  // reuse it. Called when a particle dies (after its buffer slot is zeroed).
  remove(item: string | number): void {
    const slot = this._items[item];

    if (slot === undefined) {
      return;
    }

    delete this._items[item];
    this._freeSlots.push(slot);
  }

  destroy(): void {
    this._items = {};
    this._freeSlots = [];
    this.count = 0;
  }
}
