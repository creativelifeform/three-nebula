/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Alpha', () => {
  const behaviour = new Proton.Alpha(1, 0);

  it('should instantiate with the correct properties', done => {
    const {
      life,
      age,
      energy,
      dead,
      _same,
      easing,
      alphaA,
      alphaB
    } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFalse(_same);
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

  it('should initialize the particle with the correct properties', done => {
    const particle = new Proton.Particle();

    behaviour.initialize(particle);

    const {
      alpha,
      useAlpha,
      transform: { alphaA, alphaB }
    } = particle;

    assert.strictEqual(alpha, 1);
    assert.isTrue(useAlpha);
    assert.strictEqual(alphaA, 1);
    assert.strictEqual(alphaB, 0);

    done();
  });

  it('should have the correct properties after applying behaviour', done => {
    const particle = new Proton.Particle();

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
      alphaB
    } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.strictEqual(age, 1000);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFalse(_same);
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
