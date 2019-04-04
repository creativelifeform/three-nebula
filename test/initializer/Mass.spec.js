/*global describe, it */

import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Mass', () => {
  const min = 3;
  const max = 5;
  const initializer = new Nebula.Mass(min, max);

  it('should have the correct properties after instantiation', done => {
    const {
      massPan,
      massPan: { _isArray, a, b, _center },
    } = initializer;

    assert.equal(initializer.type, 'Mass');
    assert.instanceOf(massPan, Nebula.Span);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(a, min);
    assert.strictEqual(b, max);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Nebula.Particle();

    initializer.initialize(particle);

    const { mass } = particle;

    assert.isAbove(mass, min);
    assert.isBelow(mass, max);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Nebula.Mass.fromJSON({
      min: 3,
      max: 10,
      center: true,
    });

    assert.instanceOf(instance, Nebula.Mass);
    assert.instanceOf(instance.massPan, Nebula.Span);
    assert.equal(instance.massPan.a, 3);
    assert.equal(instance.massPan.b, 10);
    assert.isTrue(instance.isEnabled);

    done();
  });
});
