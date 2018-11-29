/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Force', () => {
  const behaviour = new Proton.Force(1, 2, 1);

  it('should instantiate with the correct properties', done => {
    const { life, easing, age, energy, dead, force } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.instanceOf(force, Proton.Vector3D);

    done();
  });

  it('should have set the correct properties on the particle after applying the behaviour', done => {
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    const { a, old } = particle;

    assert.instanceOf(a, Proton.Vector3D);
    assert.strictEqual(a.x, 100);
    assert.strictEqual(a.y, 200);
    assert.strictEqual(a.z, 100);
    assert.strictEqual(old.a.x, 0);
    assert.strictEqual(old.a.y, 0);
    assert.strictEqual(old.a.z, 0);

    done();
  });
});
