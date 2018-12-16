/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Life', () => {
  const start = 3;
  const end = 5;
  const initializer = new Proton.Life(start, end);

  it('should have the correct properties after instantiation', done => {
    const {
      lifePan,
      lifePan: { _isArray, a, b, _center }
    } = initializer;

    assert.instanceOf(lifePan, Proton.Span);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(a, start);
    assert.strictEqual(b, end);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Proton.Particle();

    initializer.initialize(particle);

    const { life } = particle;

    assert.isAbove(life, start);
    assert.isBelow(life, end);

    done();
  });

  it('should set the particle life to Infinity if the first argument to the constructor is Infinity', done => {
    const infiniteLife = new Proton.Life(Infinity);
    const particle = new Proton.Particle();

    infiniteLife.initialize(particle);

    assert.strictEqual(particle.life, Infinity);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.Life.fromJSON({
      min: 3,
      max: 10,
      center: true
    });

    assert.instanceOf(instance, Proton.Life);
    assert.instanceOf(instance.lifePan, Proton.Span);
    assert.equal(instance.lifePan.a, 3);
    assert.equal(instance.lifePan.b, 10);

    done();
  });
});
