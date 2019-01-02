/*global describe, it */

import * as Proton from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Position', () => {
  const zoneA = new Proton.BoxZone(0, 0, 0, 5, 5, 5);
  const zoneB = new Proton.SphereZone(1, 1, 1);

  it('can instantiate with a single zone', done => {
    const position = new Proton.Position(zoneA);

    assert.equal(position.type, 'Position');
    assert.lengthOf(position.zones, 1);
    assert.instanceOf(position.zones[0], Proton.BoxZone);

    done();
  });

  it('can instantiate with multiple zones', done => {
    const position = new Proton.Position(zoneA, zoneB);

    assert.lengthOf(position.zones, 2);
    assert.instanceOf(position.zones[0], Proton.BoxZone);
    assert.instanceOf(position.zones[1], Proton.SphereZone);

    done();
  });

  it('should reset the number of zones', done => {
    const position = new Proton.Position(zoneA, zoneB);

    assert.lengthOf(position.zones, 2);

    position.reset(zoneA);

    assert.lengthOf(position.zones, 1);

    done();
  });

  it('should add a zone to the Position', done => {
    const position = new Proton.Position(zoneA);

    position.addZone(zoneB);

    assert.lengthOf(position.zones, 2);
    assert.instanceOf(position.zones[0], Proton.BoxZone);
    assert.instanceOf(position.zones[1], Proton.SphereZone);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const position = new Proton.Position(zoneA);
    const particle = new Proton.Particle();

    position.initialize(particle);

    const {
      p,
      p: { x, y, z }
    } = particle;

    assert.instanceOf(p, Proton.Vector3D);
    assert.notEqual(x, 0);
    assert.notEqual(y, 0);
    assert.notEqual(z, 0);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.Position.fromJSON({
      zoneType: 'SphereZone',
      x: 1,
      y: 1,
      z: 1,
      radius: 4
    });

    assert.instanceOf(instance, Proton.Position);
    assert.instanceOf(instance.zones[0], Proton.SphereZone);
    assert.equal(instance.zones[0].x, 1);
    assert.equal(instance.zones[0].y, 1);
    assert.equal(instance.zones[0].z, 1);
    assert.equal(instance.zones[0].radius, 4);

    done();
  });
});
