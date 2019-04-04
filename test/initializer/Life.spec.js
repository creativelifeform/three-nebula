/*global describe, it */

import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Life', () => {
  const start = 3;
  const end = 5;
  const initializer = new Nebula.Life(start, end);

  it('should have the correct properties after instantiation', done => {
    const {
      lifePan,
      lifePan: { _isArray, a, b, _center },
    } = initializer;

    assert.equal(initializer.type, 'Life');
    assert.instanceOf(lifePan, Nebula.Span);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(a, start);
    assert.strictEqual(b, end);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Nebula.Particle();

    initializer.initialize(particle);

    const { life } = particle;

    assert.isAbove(life, start);
    assert.isBelow(life, end);

    done();
  });

  it('should set the particle life to Infinity if the first argument to the constructor is Infinity', done => {
    const infiniteLife = new Nebula.Life(Infinity);
    const particle = new Nebula.Particle();

    infiniteLife.initialize(particle);

    assert.strictEqual(particle.life, Infinity);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Nebula.Life.fromJSON({
      min: 3,
      max: 10,
      center: true,
    });

    assert.instanceOf(instance, Nebula.Life);
    assert.instanceOf(instance.lifePan, Nebula.Span);
    assert.equal(instance.lifePan.a, 3);
    assert.equal(instance.lifePan.b, 10);
    assert.isTrue(instance.isEnabled);

    done();
  });
});
