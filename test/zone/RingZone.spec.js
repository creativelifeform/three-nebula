import * as Nebula from '../../src';

import { mulberry32 } from '../../src/math/rng';
import chai from 'chai';

const { assert } = chai;
const { RingZone } = Nebula;

describe('zone -> RingZone', () => {
  it('defaults to the origin, inner 0 / outer 100, emission-first', () => {
    const zone = new RingZone();

    assert.equal(zone.type, 'RingZone');
    assert.equal(zone.x, 0);
    assert.equal(zone.y, 0);
    assert.equal(zone.z, 0);
    assert.equal(zone.innerRadius, 0);
    assert.equal(zone.outerRadius, 100);
    // Planar → no meaningful 3D boundary.
    assert.isFalse(zone.supportsCrossing);
  });

  it('samples uniformly within the annulus, in the XZ plane at centre y', () => {
    const zone = new RingZone(0, 5, 0, 40, 100);
    const rng = mulberry32(123);

    for (let i = 0; i < 500; i++) {
      const v = zone.getPosition(rng);
      const r = Math.hypot(v.x, v.z);

      assert.isAtLeast(r, 40 - 1e-6);
      assert.isAtMost(r, 100 + 1e-6);
      assert.closeTo(v.y, 5, 1e-9);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const a = new RingZone(0, 0, 0, 40, 100);
    const b = new RingZone(0, 0, 0, 40, 100);
    const va = a.getPosition(mulberry32(9));
    const captured = { x: va.x, y: va.y, z: va.z };
    const vb = b.getPosition(mulberry32(9));

    assert.closeTo(captured.x, vb.x, 1e-12);
    assert.closeTo(captured.y, vb.y, 1e-12);
    assert.closeTo(captured.z, vb.z, 1e-12);
  });

  it('deserialises from JSON via Position.fromJSON', () => {
    const position = Nebula.Position.fromJSON({
      zoneType: 'RingZone',
      x: 0,
      y: 0,
      z: 0,
      innerRadius: 40,
      outerRadius: 100,
    });
    const [zone] = position.zones;

    assert.instanceOf(zone, RingZone);
    assert.equal(zone.innerRadius, 40);
    assert.equal(zone.outerRadius, 100);
  });
});
