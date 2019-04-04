/*global describe, it */

import * as Nebula from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const { spy } = sinon;

describe('behaviour -> Attraction', () => {
  const behaviour = new Nebula.Attraction();

  it('should instantiate with the correct properties', done => {
    const {
      type,
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
      lengthSq,
    } = behaviour;

    assert.equal(type, 'Attraction');
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isTrue(targetPosition instanceof Nebula.Vector3D);
    assert.strictEqual(radius, 1000);
    assert.strictEqual(force, 10000);
    assert.strictEqual(radiusSq, 1000000);
    assert.isTrue(attractionForce instanceof Nebula.Vector3D);
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
      lengthSq,
    } = behaviour;
    const particle = new Nebula.Particle();

    behaviour.applyBehaviour(particle, TIME);

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isTrue(targetPosition instanceof Nebula.Vector3D);
    assert.strictEqual(radius, 1000);
    assert.strictEqual(force, 10000);
    assert.strictEqual(radiusSq, 1000000);
    assert.isTrue(attractionForce instanceof Nebula.Vector3D);
    assert.strictEqual(lengthSq, 0);

    done();
  });

  it('should reset the behaviour properties', done => {
    behaviour.reset(new Nebula.Vector3D(1, 4, 1), 4, 12, 3);

    assert.deepEqual(Object.values(behaviour.targetPosition), [1, 4, 1]);
    assert.equal(behaviour.force, 400);
    assert.equal(behaviour.radius, 12);
    assert.equal(behaviour.life, 3);

    done();
  });

  it('should add the attraction force to the particle acceleration', done => {
    const attraction = new Nebula.Attraction();
    const particle = new Nebula.Particle();
    const addSpy = spy(particle.acceleration, 'add');

    attraction.targetPosition.set(100, 333, 664);

    attraction.radiusSq = 561885;

    attraction.applyBehaviour(particle, TIME);

    assert(addSpy.calledOnceWith(attraction.attractionForce));

    addSpy.restore();

    assert.deepEqual(Object.values(particle.acceleration), [
      0.23744744021624944,
      0.7906999759201108,
      1.5766510030358964,
    ]);

    done();
  });

  it('should construct the behaviour from a JSON object', done => {
    const instance = Nebula.Attraction.fromJSON({
      x: 1,
      y: 4,
      z: 1,
      force: 4,
      radius: 12,
      life: 3,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Nebula.Attraction);
    assert.deepEqual(Object.values(instance.targetPosition), [1, 4, 1]);
    assert.instanceOf(instance.targetPosition, Nebula.Vector3D);
    assert.equal(instance.force, 400);
    assert.equal(instance.radius, 12);
    assert.equal(instance.life, 3);
    assert.isTrue(instance.isEnabled);

    done();
  });
});
