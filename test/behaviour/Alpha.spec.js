/*global describe, it */

import * as Nebula from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import { getEasingByName } from '../../src/ease';

const { assert } = chai;

describe('behaviour -> Alpha', () => {
  const behaviour = new Nebula.Alpha(1, 0);

  it('should instantiate with the correct properties', done => {
    const {
      type,
      life,
      age,
      energy,
      dead,
      _same,
      easing,
      alphaA,
      alphaB,
    } = behaviour;

    assert.strictEqual(type, 'Alpha');
    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFalse(_same);
    assert.isFunction(easing);
    assert.isTrue(alphaA instanceof Nebula.Span);
    assert.isTrue(alphaB instanceof Nebula.Span);
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

  it('should initialize the particle with the correct properties', done => {
    const particle = new Nebula.Particle();

    behaviour.initialize(particle);

    const {
      alpha,
      useAlpha,
      transform: { alphaA, alphaB },
    } = particle;

    assert.strictEqual(alpha, 1);
    assert.isTrue(useAlpha);
    assert.strictEqual(alphaA, 1);
    assert.strictEqual(alphaB, 0);

    done();
  });

  it('should have the correct properties after applying behaviour', done => {
    const particle = new Nebula.Particle();

    behaviour.initialize(particle);
    behaviour.applyBehaviour(particle, TIME);

    const {
      life,
      age,
      energy,
      dead,
      _same,
      easing,
      alphaA,
      alphaB,
    } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 1000);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFalse(_same);
    assert.isFunction(easing);
    assert.isTrue(alphaA instanceof Nebula.Span);
    assert.isTrue(alphaB instanceof Nebula.Span);
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

  it('should construct the behaviour from a JSON object', done => {
    const instance = Nebula.Alpha.fromJSON({
      alphaA: 0.4,
      alphaB: 1,
      life: 4,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Nebula.Alpha);
    assert.instanceOf(instance.alphaA, Nebula.Span);
    assert.instanceOf(instance.alphaB, Nebula.Span);
    assert.equal(instance.life, 4);
    assert.deepEqual(instance.easing, getEasingByName('easeInOutExpo'));
    assert.isTrue(instance.isEnabled);

    done();
  });
});
