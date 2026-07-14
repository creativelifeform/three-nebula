
import * as Nebula from '../../src';

import Behaviour from '../../src/behaviour/Behaviour';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const { spy } = sinon;

describe('behaviour -> Behaviour', () => {
  const behaviour = new Behaviour();

  it('should instantiate with the correct properties and methods', () => {
    const { type, id, life, easing, age, energy, dead } = behaviour;

    assert.equal(type, 'Behaviour');
    assert.isString(id);
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFunction(behaviour.reset);
    assert.isFunction(behaviour.normalizeForce);
    assert.isFunction(behaviour.normalizeValue);
    assert.isFunction(behaviour.initialize);
    assert.isFunction(behaviour.applyBehaviour);
    assert.isFunction(behaviour.mutate);
    assert.isFunction(behaviour.destroy);

  });

  it('should set life to infinity if null is supplied', () => {
    const { life } = new Behaviour(null);

    assert.strictEqual(life, Infinity);

  });

  it('should set life to infinity if NaN is supplied', () => {
    const { life } = new Behaviour('null');

    assert.strictEqual(life, Infinity);

  });

  it('should normalize force correctly', () => {
    const force = behaviour.normalizeForce(new Nebula.Vector3D(1, 2.4, 3));

    assert.deepEqual(Object.values(force), [100, 240, 300]);

  });

  it('should normalize the value correctly', () => {
    assert.strictEqual(behaviour.normalizeValue(1.22), 122);

  });

  it('should not call the mutate method if the behaviour is disabled', () => {
    const disabled = new Behaviour(Infinity, () => {}, 'test', false);
    const particle = new Nebula.Particle();
    const mutateSpy = spy(disabled, 'mutate');

    disabled.applyBehaviour(particle);
    assert(mutateSpy.notCalled);

  });

  it('should set the particle to dead when age is > life', () => {
    const life = 1;
    const hasLife = new Behaviour(life);
    const particle = new Nebula.Particle();

    hasLife.energize(particle, life + 1);

    assert.isTrue(hasLife.dead);
    assert.equal(hasLife.energy, 0);

  });
});
