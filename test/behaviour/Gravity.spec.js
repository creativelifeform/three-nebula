/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import { getEasingByName } from '../../src/ease';

const { assert } = chai;

describe('behaviour -> Gravity', () => {
  const behaviour = new Proton.Gravity(1);

  it('should instantiate with the correct properties', done => {
    const { life, easing, age, energy, dead, force } = behaviour;

    assert.equal(behaviour.type, 'Gravity');
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.instanceOf(force, Proton.Vector3D);
    assert.strictEqual(force.y, -100);

    done();
  });

  it('should have set the correct properties on the particle after applying the behaviour', done => {
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    const { acceleration, old } = particle;

    assert.instanceOf(acceleration, Proton.Vector3D);
    assert.strictEqual(acceleration.x, 0);
    assert.strictEqual(acceleration.y, -100);
    assert.strictEqual(acceleration.z, 0);
    assert.strictEqual(old.acceleration.x, 0);
    assert.strictEqual(old.acceleration.y, 0);
    assert.strictEqual(old.acceleration.z, 0);

    done();
  });

  it('should construct the behaviour from a JSON object', done => {
    const instance = Proton.Gravity.fromJSON({
      gravity: 1,
      life: 3,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Proton.Gravity);
    assert.instanceOf(instance.force, Proton.Vector3D);
    assert.strictEqual(instance.force.x, 0);
    assert.strictEqual(instance.force.y, -100);
    assert.strictEqual(instance.force.z, 0);
    assert.equal(instance.life, 3);
    assert.deepEqual(instance.easing, getEasingByName('easeInOutExpo'));
    assert.isTrue(instance.isEnabled);

    done();
  });
});
