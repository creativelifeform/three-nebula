import * as Nebula from '../../src';

import { mulberry32 } from '../../src/math/rng';
import chai from 'chai';

const { assert } = chai;
const { DiscZone } = Nebula;

describe('zone -> DiscZone', () => {
  it('is a RingZone with inner radius 0, emission-first', () => {
    const zone = new DiscZone(1, 2, 3, 120);

    assert.equal(zone.type, 'DiscZone');
    assert.instanceOf(zone, Nebula.RingZone);
    assert.equal(zone.x, 1);
    assert.equal(zone.y, 2);
    assert.equal(zone.z, 3);
    assert.equal(zone.innerRadius, 0);
    assert.equal(zone.outerRadius, 120);
    assert.isFalse(zone.supportsCrossing);
  });

  it('samples within the disc in the XZ plane at centre y', () => {
    const zone = new DiscZone(0, -8, 0, 120);
    const rng = mulberry32(321);

    for (let i = 0; i < 500; i++) {
      const v = zone.getPosition(rng);

      assert.isAtMost(Math.hypot(v.x, v.z), 120 + 1e-6);
      assert.closeTo(v.y, -8, 1e-9);
    }
  });

  it('deserialises from JSON via Position.fromJSON', () => {
    const position = Nebula.Position.fromJSON({
      zoneType: 'DiscZone',
      x: 0,
      y: 0,
      z: 0,
      radius: 120,
    });
    const [zone] = position.zones;

    assert.instanceOf(zone, DiscZone);
    assert.equal(zone.outerRadius, 120);
  });
});
