/*global describe, it */

import * as Proton from '../../src';

import {
  DEFAULT_AGE,
  DEFAULT_ALPHA,
  DEFAULT_BODY,
  DEFAULT_DEAD,
  DEFAULT_EASING,
  DEFAULT_ENERGY,
  DEFAULT_LIFE,
  DEFAULT_MASS,
  DEFAULT_PARENT,
  DEFAULT_RADIUS,
  DEFAULT_SCALE,
  DEFAULT_SLEEP,
  DEFAULT_USE_ALPHA,
  DEFAULT_USE_COLOR
} from '../../src/core/constants';

import chai from 'chai';
import { preset } from './fixtures/particle';
import sinon from 'sinon';

const { assert } = chai;
const { Particle } = Proton;
const { values, keys } = Object;
const { spy } = sinon;

describe('core -> Particle', () => {
  it('should set all default properties', done => {
    const particle = new Particle();

    assert.strictEqual(particle.life, Infinity);
    assert.strictEqual(particle.age, 0);
    assert.strictEqual(particle.energy, 1);
    assert.isFalse(particle.dead);
    assert.isFalse(particle.sleep);
    assert.isNull(particle.body);
    assert.isNull(particle.parent);
    assert.strictEqual(particle.mass, 1);
    assert.strictEqual(particle.radius, 10);
    assert.strictEqual(particle.alpha, 1);
    assert.strictEqual(particle.scale, 1);
    assert.isFalse(particle.useColor);
    assert.isFalse(particle.useAlpha);
    assert.isFunction(particle.easing);
    assert.instanceOf(particle.p, Proton.Vector3D);
    assert.instanceOf(particle.v, Proton.Vector3D);
    assert.instanceOf(particle.a, Proton.Vector3D);
    assert.deepEqual(values(particle.p), [0, 0, 0]);
    assert.deepEqual(values(particle.v), [0, 0, 0]);
    assert.deepEqual(values(particle.a), [0, 0, 0]);
    assert.isObject(particle.old);
    assert.instanceOf(particle.old.p, Proton.Vector3D);
    assert.instanceOf(particle.old.v, Proton.Vector3D);
    assert.instanceOf(particle.old.a, Proton.Vector3D);
    assert.deepEqual(values(particle.old.p), [0, 0, 0]);
    assert.deepEqual(values(particle.old.v), [0, 0, 0]);
    assert.deepEqual(values(particle.old.a), [0, 0, 0]);
    assert.isArray(particle.behaviours);
    assert.lengthOf(particle.behaviours, 0);
    assert.isObject(particle.transform);
    assert.isObject(particle.color);
    assert.deepEqual(keys(particle.color), ['r', 'g', 'b']);
    assert.deepEqual(values(particle.color), [0, 0, 0]);
    assert.instanceOf(particle.rotation, Proton.Vector3D);
    assert.deepEqual(values(particle.rotation), [0, 0, 0]);

    done();
  });

  it('should fully instantiate with the correct properties based on the object passed', done => {
    const particle = new Particle(preset);

    assert.strictEqual(particle.life, preset.life);
    assert.strictEqual(particle.age, preset.age);
    assert.strictEqual(particle.energy, preset.energy);
    assert.strictEqual(particle.dead, preset.dead);
    assert.strictEqual(particle.sleep, preset.sleep);
    assert.strictEqual(particle.body, preset.body);
    assert.strictEqual(particle.parent, preset.parent);
    assert.strictEqual(particle.mass, preset.mass);
    assert.strictEqual(particle.radius, preset.radius);
    assert.strictEqual(particle.alpha, preset.alpha);
    assert.strictEqual(particle.scale, preset.scale);
    assert.strictEqual(particle.useColor, preset.useColor);
    assert.strictEqual(particle.useAlpha, preset.useAlpha);
    assert.strictEqual(particle.easing, preset.easing);
    assert.strictEqual(particle.p, preset.p);
    assert.strictEqual(particle.v, preset.v);
    assert.strictEqual(particle.a, preset.a);
    assert.deepEqual(particle.old, preset.old);
    assert.deepEqual(particle.behaviours, preset.behaviours);
    assert.strictEqual(particle.transform, preset.transform);
    assert.deepEqual(particle.color, preset.color);
    assert.deepEqual(particle.rotation, preset.rotation);

    done();
  });

  it('should get the particle direction', done => {
    const particle = new Particle(preset);

    assert.equal(particle.getDirection(), 153.41505666009473);

    done();
  });

  it('should reset the particle\'s clearable properties and return the particle', done => {
    const particle = new Particle(preset);
    const reset = particle.reset();

    const { p, v, a, old, color, transform, behaviours, rotation } = particle;

    assert.strictEqual(reset.age, DEFAULT_AGE);
    assert.strictEqual(reset.alpha, DEFAULT_ALPHA);
    assert.strictEqual(reset.body, DEFAULT_BODY);
    assert.strictEqual(reset.dead, DEFAULT_DEAD);
    assert.strictEqual(reset.easing, DEFAULT_EASING);
    assert.strictEqual(reset.energy, DEFAULT_ENERGY);
    assert.strictEqual(reset.life, DEFAULT_LIFE);
    assert.strictEqual(reset.mass, DEFAULT_MASS);
    assert.strictEqual(reset.parent, DEFAULT_PARENT);
    assert.strictEqual(reset.radius, DEFAULT_RADIUS);
    assert.strictEqual(reset.scale, DEFAULT_SCALE);
    assert.strictEqual(reset.sleep, DEFAULT_SLEEP);
    assert.strictEqual(reset.useAlpha, DEFAULT_USE_ALPHA);
    assert.strictEqual(reset.useColor, DEFAULT_USE_COLOR);
    assert.deepEqual(values(p), [0, 0, 0]);
    assert.deepEqual(values(v), [0, 0, 0]);
    assert.deepEqual(values(a), [0, 0, 0]);
    assert.deepEqual(values(old.p), [0, 0, 0]);
    assert.deepEqual(values(old.v), [0, 0, 0]);
    assert.deepEqual(values(old.a), [0, 0, 0]);
    assert.deepEqual(values(color), [0, 0, 0]);
    assert.isEmpty(transform);
    assert.isEmpty(behaviours);
    assert.deepEqual(values(rotation), [0, 0, 0]);
    assert.instanceOf(reset, Particle);

    done();
  });

  it('should add a behaviour to the particle and call the behaviour initialize method with the particle', done => {
    const particle = new Particle();
    const behaviour = new Proton.Attraction();
    const spyInitialize = spy(behaviour, 'initialize');

    particle.addBehaviour(behaviour);

    assert.isNotEmpty(particle.behaviours);
    assert.instanceOf(particle.behaviours[0], Proton.Attraction);
    assert(spyInitialize.calledOnce);
    assert(spyInitialize.calledWith(particle));

    spyInitialize.restore();
    done();
  });

  it('should add a behaviours to the particle and call the behaviours\'s initialize method with the particle', done => {
    const particle = new Particle();
    const behaviours = [new Proton.Attraction(), new Proton.Repulsion()];
    const spyAttraction = spy(behaviours[0], 'initialize');
    const spyRepulsion = spy(behaviours[1], 'initialize');
    const spies = [spyAttraction, spyRepulsion];

    particle.addBehaviours(behaviours);

    assert.lengthOf(particle.behaviours, 2);
    assert.instanceOf(particle.behaviours[0], Proton.Repulsion);
    assert.instanceOf(particle.behaviours[1], Proton.Attraction);

    spies.forEach(spy => {
      assert(spy.calledOnce);
      assert(spy.calledWith(particle));

      spy.restore();
    });

    done();
  });

  it('should remove the behaviour from the particle', done => {
    const attraction = new Proton.Attraction();
    const particle = new Particle();
    const behaviours = [attraction, new Proton.Repulsion()];

    particle.addBehaviours(behaviours);
    particle.removeBehaviour(attraction);

    assert.lengthOf(particle.behaviours, 1);
    assert.instanceOf(particle.behaviours[0], Proton.Repulsion);

    done();
  });

  it('should remove all behaviours from the particle', done => {
    const particle = new Particle();
    const behaviours = [new Proton.Attraction(), new Proton.Repulsion()];

    particle.addBehaviours(behaviours);
    particle.removeAllBehaviours();

    assert.isEmpty(particle.behaviours);

    done();
  });

  it('should kill the particle', done => {
    const particle = new Particle();

    particle.addBehaviours([new Proton.Attraction(), new Proton.Repulsion()]);
    particle.parent = {};

    particle.destroy();

    const { behaviours, energy, dead, parent } = particle;

    assert.isEmpty(behaviours);
    assert.equal(energy, 0);
    assert.isTrue(dead);
    assert.isNull(parent);

    done();
  });
});

describe('particle update', () => {
  it('should set the particle age, apply behaviours to the particle and set its energy if particle.sleep === false', done => {
    const particle = new Particle(preset);
    const attraction = new Proton.Attraction();
    const time = 2;
    const attractionSpy = spy(attraction, 'applyBehaviour');
    const easingSpy = spy(particle, 'easing');
    const spies = [attractionSpy, easingSpy];

    particle.removeAllBehaviours();
    particle.sleep = false;
    particle.dead = false;
    particle.age = 0;
    particle.life = 4;
    particle.addBehaviour(attraction);

    particle.update(time, 0);

    spies.forEach((spy, index) => {
      assert(spy.calledOnce);

      index === 0 && assert(spy.calledWith(particle, time, 0));

      spy.restore();
    });

    assert.equal(particle.age, 2);
    assert.equal(particle.energy, 0.75);
    assert.isFalse(particle.dead);

    done();
  });

  it('should not set age or apply behaviours if particle.sleep === true', done => {
    const particle = new Particle(preset);
    const attraction = new Proton.Attraction();
    const time = 2;
    const attractionSpy = spy(attraction, 'applyBehaviour');
    const spies = [attractionSpy];

    particle.removeAllBehaviours();
    particle.sleep = true;
    particle.dead = false;
    particle.age = 0;
    particle.life = 4;
    particle.addBehaviour(attraction);

    particle.update(time, 0);

    spies.forEach(spy => {
      assert(spy.notCalled);

      spy.restore();
    });

    assert.equal(particle.age, 0);
    assert.equal(particle.energy, 1);
    assert.isFalse(particle.dead);

    done();
  });

  it('should call particle.destroy the particle if age >= life', done => {
    const particle = new Particle(preset);
    const time = 2;
    const destroySpy = spy(particle, 'destroy');

    particle.sleep = false;
    particle.dead = false;
    particle.age = 6;
    particle.life = 4;

    particle.update(time, 0);

    assert(destroySpy.calledOnce);

    destroySpy.restore();

    done();
  });
});
