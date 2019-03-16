/*global describe, it */

import * as Proton from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Radius', () => {
  const radius = 5;
  const initializer = new Proton.Radius(radius);

  it('should have the correct properties after instantiation', done => {
    const {
      radius,
      radius: { _isArray, a, b, _center },
    } = initializer;

    assert.equal(initializer.type, 'Radius');
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
      transform: { oldRadius },
    } = particle;

    assert.strictEqual(radius, 5);
    assert.strictEqual(oldRadius, 5);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.Radius.fromJSON({
      width: 3,
      height: 10,
      center: true,
    });

    assert.instanceOf(instance, Proton.Radius);
    assert.instanceOf(instance.radius, Proton.Span);
    assert.equal(instance.radius.a, 3);
    assert.equal(instance.radius.b, 10);
    assert.isTrue(instance.isEnabled);

    done();
  });
});
