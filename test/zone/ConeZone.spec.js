import * as Nebula from '../../src';

import { mulberry32 } from '../../src/math/rng';
import chai from 'chai';

const { assert } = chai;
const { ConeZone, Particle } = Nebula;

describe('zone -> ConeZone', () => {
  it('defaults, and is a solid 3D boundary', () => {
    const zone = new ConeZone();

    assert.equal(zone.type, 'ConeZone');
    assert.equal(zone.radius, 100);
    assert.equal(zone.height, 100);
    assert.isTrue(zone.supportsCrossing);
  });

  it('samples within the cone — radius grows linearly from apex to base', () => {
    const zone = new ConeZone(0, 0, 0, 100, 200); // apex at origin, opening +Y
    const rng = mulberry32(55);

    for (let i = 0; i < 500; i++) {
      const v = zone.getPosition(rng);

      assert.isAtLeast(v.y, -1e-6);
      assert.isAtMost(v.y, 200 + 1e-6);

      const allowed = (v.y / 200) * 100;

      assert.isAtMost(Math.hypot(v.x, v.z), allowed + 1e-6);
    }
  });

  it('_dead kills particles outside the cone, keeps those inside', () => {
    const zone = new ConeZone(0, 0, 0, 100, 200);

    // Wide out near the apex (where the allowed radius is ~0).
    const outside = new Particle();
    outside.position.set(80, 10, 0);
    outside.radius = 0;
    zone._dead(outside);
    assert.isTrue(outside.dead);

    // Near the axis, mid-height → inside.
    const inside = new Particle();
    inside.position.set(2, 100, 0);
    inside.radius = 0;
    zone._dead(inside);
    assert.isFalse(inside.dead);
  });

  it('deserialises from JSON via Position.fromJSON', () => {
    const position = Nebula.Position.fromJSON({
      zoneType: 'ConeZone',
      x: 0,
      y: 0,
      z: 0,
      radius: 100,
      height: 200,
    });
    const [zone] = position.zones;

    assert.instanceOf(zone, ConeZone);
    assert.equal(zone.radius, 100);
    assert.equal(zone.height, 200);
  });
});
