/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Collision', () => {
  const emitter = new Proton.Emitter();
  const behaviour = new Proton.Collision(emitter, true, () => {});
  const particleA = new Proton.Particle({ mass: 1 });
  const particleB = new Proton.Particle({ mass: 4 });

  it('should instantiate with the correct properties', done => {
    assert.equal(behaviour.type, 'Collision');
    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isTrue(behaviour.emitter instanceof Proton.Emitter);
    assert.isTrue(behaviour.useMass);
    assert.isFunction(behaviour.onCollide);
    assert.isArray(behaviour.particles);
    assert.isTrue(behaviour.delta instanceof Proton.Vector3D);
    assert.isFunction(behaviour._getAverageMass);

    done();
  });

  it('should have the correct properties after applying behaviour', done => {
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isTrue(behaviour.emitter instanceof Proton.Emitter);
    assert.isTrue(behaviour.useMass);
    assert.isFunction(behaviour.onCollide);
    assert.isArray(behaviour.particles);
    assert.isTrue(behaviour.delta instanceof Proton.Vector3D);

    done();
  });

  it('should calculate the average mass', done => {
    const averageMass = behaviour._getAverageMass(particleA, particleB);

    assert.strictEqual(averageMass, 0.8);

    done();
  });

  it('should return an average mass of 0.5 if useMass is false', done => {
    behaviour.useMass = false;

    const averageMass = behaviour._getAverageMass(particleA, particleB);

    assert.strictEqual(averageMass, 0.5);

    done();
  });
});
