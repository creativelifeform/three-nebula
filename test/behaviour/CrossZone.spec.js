/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import { getEasingByName } from '../../src/ease';
import sinon from 'sinon';

const { spy } = sinon;
const { assert } = chai;

describe('behaviour -> CrossZone', () => {
  const zone = new Proton.BoxZone(0, 0, 0, 1, 1, 1);
  const behaviour = new Proton.CrossZone(zone, 'dead');

  it('should instantiate with the correct properties', done => {
    const { life, easing, age, energy, dead, zone } = behaviour;

    assert.equal(behaviour.type, 'CrossZone');
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.instanceOf(zone, Proton.BoxZone);
    assert.strictEqual(zone.crossType, 'dead');

    done();
  });

  it('should call the zone.crossing method when applying the behaviour', done => {
    const particle = new Proton.Particle();

    spy(behaviour.zone, 'crossing');
    behaviour.applyBehaviour(particle, TIME);
    assert(behaviour.zone.crossing.calledOnce);
    behaviour.zone.crossing.restore();

    done();
  });

  it('should construct the behaviour from a JSON object', done => {
    const instance = Proton.CrossZone.fromJSON({
      zoneType: 'SphereZone',
      zoneParams: {
        x: 1,
        y: 1,
        z: 1,
        radius: 10,
      },
      crossType: 'bound',
      life: 3,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Proton.CrossZone);
    assert.instanceOf(instance.zone, Proton.SphereZone);
    assert.equal(instance.zone.x, 1);
    assert.equal(instance.zone.y, 1);
    assert.equal(instance.zone.z, 1);
    assert.equal(instance.zone.radius, 10);
    assert.equal(instance.zone.crossType, 'bound');
    assert.equal(instance.life, 3);
    assert.deepEqual(instance.easing, getEasingByName('easeInOutExpo'));
    assert.isTrue(instance.isEnabled);

    done();
  });
});
