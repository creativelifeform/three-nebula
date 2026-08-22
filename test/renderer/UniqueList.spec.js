import { UniqueList } from '../../src/renderer/GPURenderer/common/stores';
import chai from 'chai';

const { assert } = chai;

describe('renderer -> GPURenderer -> UniqueList', () => {
  it('assigns a stable slot per item and dedupes repeat adds', () => {
    const list = new UniqueList();

    list.add('a');
    list.add('b');
    list.add('a'); // repeat, should not mint a new slot

    assert.equal(list.find('a'), 0);
    assert.equal(list.find('b'), 1);
    assert.equal(list.count, 2);
  });

  it('recycles a freed slot on the next add', () => {
    const list = new UniqueList();

    list.add('a'); // slot 0
    list.add('b'); // slot 1
    list.remove('a'); // frees slot 0
    list.add('c'); // reuses slot 0

    assert.equal(list.find('c'), 0);
    assert.equal(list.find('b'), 1);
    assert.equal(list.count, 2); // high-water mark unchanged
  });

  it('keeps the slot space bounded by live items under heavy churn', () => {
    // Emulate the renderer lifecycle: every spawn is a brand-new (deterministic,
    // per-spawn) id, but at most `live` are alive at once. Mirroring the real
    // order — a particle is added, then the oldest is evicted — the live set
    // peaks at `live + 1`, so slots span 0..live. The invariant the fixed-size
    // render buffer depends on is that this never grows with total spawns.
    const live = 8;
    const peak = live + 1;
    const totalSpawns = 5000;
    const alive = [];
    let maxSlot = -1;

    const list = new UniqueList();

    for (let i = 0; i < totalSpawns; i++) {
      const id = `particle-${i}`;

      list.add(id);
      maxSlot = Math.max(maxSlot, list.find(id));
      alive.push(id);

      if (alive.length > live) {
        list.remove(alive.shift());
      }
    }

    assert.isBelow(maxSlot, peak, 'slot index stayed within the live window');
    assert.isAtMost(list.count, peak);
  });

  it('remove is a no-op for an unknown item', () => {
    const list = new UniqueList();

    list.add('a');
    list.remove('does-not-exist');

    assert.equal(list.find('a'), 0);
    assert.equal(list.count, 1);
  });

  it('destroy clears items, freed slots and the counter', () => {
    const list = new UniqueList();

    list.add('a');
    list.remove('a');
    list.destroy();

    assert.equal(list.count, 0);
    assert.equal(list.find('a'), undefined);

    list.add('b'); // starts from a clean slate
    assert.equal(list.find('b'), 0);
  });
});
