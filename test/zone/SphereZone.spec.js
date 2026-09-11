import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;
const { SphereZone } = Nebula;

describe('zone -> SphereZone', () => {
  it('defaults to the origin with radius 100', () => {
    const zone = new SphereZone();

    assert.equal(zone.x, 0);
    assert.equal(zone.y, 0);
    assert.equal(zone.z, 0);
    assert.equal(zone.radius, 100);
  });

  it('single-arg form sets the radius, centred at the origin', () => {
    const zone = new SphereZone(45);

    assert.equal(zone.x, 0);
    assert.equal(zone.y, 0);
    assert.equal(zone.z, 0);
    assert.equal(zone.radius, 45);
  });

  it('four-arg form maps centerX/Y/Z and radius to x/y/z/radius (regression)', () => {
    // Previously the constructor set this.y = this.z = x, collapsing the centre
    // to (cx, cx, cx) and ignoring centerY/centerZ.
    const zone = new SphereZone(10, 20, 30, 45);

    assert.equal(zone.x, 10);
    assert.equal(zone.y, 20, 'centerY was ignored before the fix');
    assert.equal(zone.z, 30, 'centerZ was ignored before the fix');
    assert.equal(zone.radius, 45);
  });
});
