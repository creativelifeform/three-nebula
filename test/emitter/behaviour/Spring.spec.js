/*global describe, it */

import * as Proton from '../../../src';

import { TIME } from '../../constants';
import chai from 'chai';
import { getEasingByName } from '../../../src/ease';

const { assert } = chai;

describe('behaviour -> Spring', () => {
  const behaviour = new Proton.Spring(2, 5, 6);

  it('should instantiate with the correct properties', done => {
    const {
      life,
      easing,
      age,
      energy,
      dead,
      pos,
      pos: { x, y, z },
      spring,
      friction
    } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.instanceOf(pos, Proton.Vector3D);
    assert.deepEqual(Object.values(pos), [x, y, z]);
    assert.strictEqual(spring, 0.1);
    assert.strictEqual(friction, 0.98);

    done();
  });

  it('should have set the correct properties on the particle after applying the behaviour', done => {
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    const { v, old } = particle;

    assert.deepEqual(Object.values(v), [0.2, 0.5, 0.6000000000000001]);
    assert.deepEqual(Object.values(old.v), [0, 0, 0]);

    done();
  });

  it('should construct the behaviour from a JSON object', done => {
    const instance = Proton.Spring.fromJSON({
      x: 1,
      y: 4,
      z: 1,
      spring: 0.4,
      friction: 0.12,
      life: 3,
      easing: 'easeInOutExpo'
    });

    assert.instanceOf(instance, Proton.Spring);
    assert.deepEqual(Object.values(instance.pos), [1, 4, 1]);
    assert.instanceOf(instance.pos, Proton.Vector3D);
    assert.equal(instance.spring, 0.4);
    assert.equal(instance.friction, 0.12);
    assert.equal(instance.life, 3);
    assert.deepEqual(instance.easing, getEasingByName('easeInOutExpo'));

    done();
  });
});
