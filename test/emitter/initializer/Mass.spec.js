/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Mass', () => {
  const min = 3;
  const max = 5;
  const initializer = new Proton.Mass(min, max);

  it('should have the correct properties after instantiation', done => {
    const {
      massPan,
      massPan: { _isArray, a, b, _center }
    } = initializer;

    assert.instanceOf(massPan, Proton.Span);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(a, min);
    assert.strictEqual(b, max);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Proton.Particle();

    initializer.initialize(particle);

    const { mass } = particle;

    assert.isAbove(mass, min);
    assert.isBelow(mass, max);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.Mass.fromJSON({
      min: 3,
      max: 10,
      center: true
    });

    assert.instanceOf(instance, Proton.Mass);
    assert.instanceOf(instance.massPan, Proton.Span);
    assert.equal(instance.massPan.a, 3);
    assert.equal(instance.massPan.b, 10);

    done();
  });
});
