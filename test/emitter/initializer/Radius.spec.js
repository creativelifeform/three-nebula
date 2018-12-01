/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Radius', () => {
  const radius = 5;
  const initializer = new Proton.Radius(radius);

  it('should have the correct properties after instantiation', done => {
    const {
      radius,
      radius: { _isArray, a, b, _center }
    } = initializer;

    assert.instanceOf(radius, Proton.Span);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(a, 5);
    assert.strictEqual(b, 5);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Proton.Particle();

    initializer.initialize(particle);

    const {
      radius,
      transform: { oldRadius }
    } = particle;

    assert.strictEqual(radius, 5);
    assert.strictEqual(oldRadius, 5);

    done();
  });
});
