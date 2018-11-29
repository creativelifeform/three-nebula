/*global describe, it */

import * as Proton from '../src';

import chai from 'chai';

const { assert } = chai;

describe('Alpha', () => {
  it('should instantiate with the correct properties', done => {
    const behaviour = new Proton.Alpha(1, 0);
    const { life, age, energy, dead, easing, alphaA, alphaB } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFunction(easing);
    assert.isTrue(alphaA instanceof Proton.Span);
    assert.isTrue(alphaB instanceof Proton.Span);
    assert.isFalse(alphaA._isArray);
    assert.isFalse(alphaA._center);
    assert.strictEqual(alphaA.a, 1);
    assert.strictEqual(alphaA.b, 1);
    assert.isFalse(alphaB._isArray);
    assert.isFalse(alphaB._center);
    assert.strictEqual(alphaB.a, 0);
    assert.strictEqual(alphaB.b, 0);

    done();
  });
});
