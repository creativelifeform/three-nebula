import * as Nebula from '../../src';

import { mulberry32 } from '../../src/math/rng';
import chai from 'chai';

const { assert } = chai;
const { CylinderZone, Particle } = Nebula;

describe('zone -> CylinderZone', () => {
  it('defaults, and is a solid 3D boundary', () => {
    const zone = new CylinderZone();

    assert.equal(zone.type, 'CylinderZone');
    assert.equal(zone.radius, 100);
    assert.equal(zone.height, 100);
    assert.isTrue(zone.supportsCrossing);
  });

  it('samples uniformly within the solid cylinder (centred on y)', () => {
    const zone = new CylinderZone(0, 0, 0, 80, 200);
    const rng = mulberry32(77);

    for (let i = 0; i < 500; i++) {
      const v = zone.getPosition(rng);

      assert.isAtMost(Math.hypot(v.x, v.z), 80 + 1e-6);
      assert.isAtMost(Math.abs(v.y), 100 + 1e-6);
    }
  });

  it('_dead kills particles outside the cylinder, keeps those inside', () => {
    const zone = new CylinderZone(0, 0, 0, 80, 200);

    const outside = new Particle();
    outside.position.set(200, 0, 0);
    outside.radius = 0;
    zone._dead(outside);
    assert.isTrue(outside.dead);

    const above = new Particle();
    above.position.set(0, 200, 0);
    above.radius = 0;
    zone._dead(above);
    assert.isTrue(above.dead);

    const inside = new Particle();
    inside.position.set(10, 20, 10);
    inside.radius = 0;
    zone._dead(inside);
    assert.isFalse(inside.dead);
  });

  it('deserialises from JSON via Position.fromJSON', () => {
    const position = Nebula.Position.fromJSON({
      zoneType: 'CylinderZone',
      x: 0,
      y: 0,
      z: 0,
      radius: 80,
      height: 200,
    });
    const [zone] = position.zones;

    assert.instanceOf(zone, CylinderZone);
    assert.equal(zone.radius, 80);
    assert.equal(zone.height, 200);
  });
});
