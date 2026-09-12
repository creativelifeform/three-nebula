import * as THREE from 'three';

import RibbonRenderer, {
  bySpawnIndex,
  ribbonIndices,
} from '../../src/renderer/RibbonRenderer';
import chai from 'chai';

const { assert } = chai;

// A minimal stand-in for a particle — the renderer only reads these fields.
const particle = ({
  instance = 'i0',
  spawnIndex = 0,
  x = 0,
  y = 0,
  z = 0,
  scale = 1,
} = {}) => ({
  emitterInstanceId: instance,
  emitterId: null,
  spawnIndex,
  position: new THREE.Vector3(x, y, z),
  color: { r: 1, g: 1, b: 1 },
  alpha: 1,
  scale,
});

describe('renderer -> RibbonRenderer -> helpers', () => {
  it('orders a spine by spawn index', () => {
    const spine = [
      particle({ spawnIndex: 2 }),
      particle({ spawnIndex: 0 }),
      particle({ spawnIndex: 1 }),
    ].sort(bySpawnIndex);

    assert.deepEqual(
      spine.map(p => p.spawnIndex),
      [0, 1, 2]
    );
  });

  it('builds two triangles (6 indices) per segment', () => {
    assert.deepEqual(ribbonIndices(1), [], 'no segments for a single point');
    assert.lengthOf(ribbonIndices(2), 6, 'one segment');
    assert.lengthOf(ribbonIndices(4), 18, 'three segments');
    // First segment references points 0 and 1 (vertices 0..3).
    assert.deepEqual(ribbonIndices(2), [0, 2, 1, 1, 2, 3]);
  });
});

describe('renderer -> RibbonRenderer -> grouping', () => {
  const makeRenderer = () =>
    new RibbonRenderer(new THREE.Object3D(), THREE, { camera: undefined });

  it('groups live particles by emitter instance', () => {
    const r = makeRenderer();

    r.onParticleCreated(particle({ instance: 'a', spawnIndex: 0 }));
    r.onParticleCreated(particle({ instance: 'b', spawnIndex: 0 }));
    r.onParticleCreated(particle({ instance: 'a', spawnIndex: 1 }));

    assert.equal(r._groups.size, 2);
    assert.lengthOf(r._groups.get('a'), 2);
    assert.lengthOf(r._groups.get('b'), 1);
  });

  it('removes a dead particle and disposes an emptied ribbon', () => {
    const r = makeRenderer();
    const p0 = particle({ instance: 'a', spawnIndex: 0 });
    const p1 = particle({ instance: 'a', spawnIndex: 1 });

    r.onParticleCreated(p0);
    r.onParticleCreated(p1);
    r.onSystemUpdate(); // builds the ribbon mesh

    assert.isTrue(r._ribbons.has('a'));

    r.onParticleDead(p0);
    assert.lengthOf(r._groups.get('a'), 1);

    r.onParticleDead(p1);
    assert.isFalse(r._groups.has('a'), 'group gone');
    assert.isFalse(r._ribbons.has('a'), 'ribbon disposed');
  });

  it('falls back to emitterId, then a shared bucket, for the group key', () => {
    const r = makeRenderer();

    r.onParticleCreated({
      ...particle(),
      emitterInstanceId: null,
      emitterId: 'node0',
    });
    r.onParticleCreated({
      ...particle(),
      emitterInstanceId: null,
      emitterId: null,
    });

    assert.isTrue(r._groups.has('node0'));
    assert.isTrue(r._groups.has('ribbon'));
  });
});

describe('renderer -> RibbonRenderer -> rebuild', () => {
  const makeRenderer = () => new RibbonRenderer(new THREE.Object3D(), THREE);

  it('hides a strip with fewer than two live points', () => {
    const r = makeRenderer();

    r.onParticleCreated(particle({ instance: 'a' }));
    r.onSystemUpdate();

    assert.isFalse(r._ribbons.get('a').mesh.visible);
  });

  it('builds a visible, NaN-free strip and sets the draw range', () => {
    const r = makeRenderer();

    for (let i = 0; i < 4; i++) {
      r.onParticleCreated(
        particle({ instance: 'a', spawnIndex: i, x: i * 10 })
      );
    }

    r.onSystemUpdate();

    const ribbon = r._ribbons.get('a');

    assert.isTrue(ribbon.mesh.visible);
    // 4 points → 3 segments → 18 indices.
    assert.equal(ribbon.geometry.drawRange.count, 18);
    assert.isAtLeast(ribbon.capacity, 4);

    const pos = ribbon.geometry.attributes.position.array;
    for (let i = 0; i < 4 * 6; i++) {
      assert.isFalse(Number.isNaN(pos[i]), `position[${i}] is finite`);
    }
  });

  it('grows buffers as the spine lengthens, keeping the high-water capacity', () => {
    const r = makeRenderer();

    for (let i = 0; i < 3; i++) {
      r.onParticleCreated(particle({ instance: 'a', spawnIndex: i, x: i }));
    }
    r.onSystemUpdate();
    assert.isAtLeast(r._ribbons.get('a').capacity, 3);

    for (let i = 3; i < 12; i++) {
      r.onParticleCreated(particle({ instance: 'a', spawnIndex: i, x: i }));
    }
    r.onSystemUpdate();
    assert.isAtLeast(r._ribbons.get('a').capacity, 12);
    assert.equal(r._ribbons.get('a').geometry.drawRange.count, 11 * 6);
  });
});

describe('renderer -> RibbonRenderer -> soft edge & smoothing', () => {
  const build = (opts = {}) => {
    const r = new RibbonRenderer(new THREE.Object3D(), THREE, opts);

    for (let i = 0; i < 4; i++) {
      r.onParticleCreated(
        particle({ instance: 'a', spawnIndex: i, x: i * 10 })
      );
    }
    r.onSystemUpdate();

    return r;
  };

  it('applies a built-in soft-edge alphaMap by default', () => {
    const r = build();

    assert.isNotNull(r._softEdgeMap, 'soft-edge map created');
    assert.strictEqual(
      r._ribbons.get('a').mesh.material.alphaMap,
      r._softEdgeMap,
      'material uses the shared soft-edge map'
    );
  });

  it('omits the soft edge when softEdge is false', () => {
    const r = build({ softEdge: false });

    assert.isNull(r._softEdgeMap);
    assert.isNull(r._ribbons.get('a').mesh.material.alphaMap);
  });

  it('disposes the soft-edge map on remove', () => {
    const r = build();

    r.remove();
    assert.isNull(r._softEdgeMap);
  });

  it('produces a finite strip with a wider smoothing window', () => {
    const r = build({ smoothing: 3 });
    const pos = r._ribbons.get('a').geometry.attributes.position.array;

    for (let i = 0; i < 4 * 6; i++) {
      assert.isFalse(Number.isNaN(pos[i]));
    }
  });

  it('collapses coincident spine points (a same-spot burst) so they do not rib', () => {
    const r = new RibbonRenderer(new THREE.Object3D(), THREE);

    // Three distinct positions, each emitted as a 2-particle cluster at one spot.
    [0, 0, 10, 10, 20, 20].forEach((x, i) =>
      r.onParticleCreated(particle({ instance: 'a', spawnIndex: i, x }))
    );
    r.onSystemUpdate();

    // Deduped spine = 3 points → 2 segments → 12 indices (not 5 segments → 30).
    assert.equal(r._ribbons.get('a').geometry.drawRange.count, 2 * 6);
  });
});
