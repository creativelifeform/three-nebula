/*global describe, it */

import * as Proton from '../src';

import chai from 'chai';

const { assert } = chai;

describe('Alpha', () => {
  it('should instantiate with the correct properties', done => {
    const behaviour = new Proton.Alpha(1, 0);
    const { life, age, energy, dead, easing, a, b } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFunction(easing);
    assert.isTrue(a instanceof Proton.Span);
    assert.isTrue(b instanceof Proton.Span);
    assert.isFalse(a._isArray);
    assert.isFalse(a._center);
    assert.strictEqual(a.a, 1);
    assert.strictEqual(a.b, 1);
    assert.isFalse(b._isArray);
    assert.isFalse(b._center);
    assert.strictEqual(b.a, 0);
    assert.strictEqual(b.b, 0);

    done();
  });
});
