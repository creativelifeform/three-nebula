
import * as Nebula from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Collision', () => {
  const emitter = new Nebula.Emitter();
  const behaviour = new Nebula.Collision(emitter, true, () => {});
  const particleA = new Nebula.Particle({ mass: 1 });
  const particleB = new Nebula.Particle({ mass: 4 });

  it('should instantiate with the correct properties', () => {
    assert.equal(behaviour.type, 'Collision');
    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isTrue(behaviour.emitter instanceof Nebula.Emitter);
    assert.isTrue(behaviour.useMass);
    assert.isFunction(behaviour.onCollide);
    assert.isArray(behaviour.particles);
    assert.isTrue(behaviour.delta instanceof Nebula.Vector3D);
    assert.isFunction(behaviour._getAverageMass);

  });

  it('should have the correct properties after applying behaviour', () => {
    const particle = new Nebula.Particle();

    behaviour.applyBehaviour(particle, TIME);

    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isTrue(behaviour.emitter instanceof Nebula.Emitter);
    assert.isTrue(behaviour.useMass);
    assert.isFunction(behaviour.onCollide);
    assert.isArray(behaviour.particles);
    assert.isTrue(behaviour.delta instanceof Nebula.Vector3D);

  });

  it('should calculate the average mass', () => {
    const averageMass = behaviour._getAverageMass(particleA, particleB);

    assert.strictEqual(averageMass, 0.8);

  });

  it('should return an average mass of 0.5 if useMass is false', () => {
    behaviour.useMass = false;

    const averageMass = behaviour._getAverageMass(particleA, particleB);

    assert.strictEqual(averageMass, 0.5);

  });
});
