/*global describe, it */

import * as Proton from '../../../src';

import { TIME } from '../../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Attraction', () => {
  const behaviour = new Proton.Attraction();

  it('should instantiate with the correct properties', done => {
    const {
      life,
      easing,
      age,
      energy,
      dead,
      targetPosition,
      radius,
      force,
      radiusSq,
      attractionForce,
      lengthSq
    } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isTrue(targetPosition instanceof Proton.Vector3D);
    assert.strictEqual(radius, 1000);
    assert.strictEqual(force, 10000);
    assert.strictEqual(radiusSq, 1000000);
    assert.isTrue(attractionForce instanceof Proton.Vector3D);
    assert.strictEqual(lengthSq, 0);

    done();
  });

  it('should have the correct properties after applying behaviour', done => {
    const {
      life,
      easing,
      age,
      energy,
      dead,
      targetPosition,
      radius,
      force,
      radiusSq,
      attractionForce,
      lengthSq
    } = behaviour;
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isTrue(targetPosition instanceof Proton.Vector3D);
    assert.strictEqual(radius, 1000);
    assert.strictEqual(force, 10000);
    assert.strictEqual(radiusSq, 1000000);
    assert.isTrue(attractionForce instanceof Proton.Vector3D);
    assert.strictEqual(lengthSq, 0);

    done();
  });
});
