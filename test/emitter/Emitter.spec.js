/*global describe, it */

import * as Proton from '../../src';

import {
  DEFAULT_BIND_EMITTER,
  DEFAULT_DAMPING,
  DEFAULT_EMITTER_RATE
} from '../../src/emitter/constants';
import EventDispatcher, { PARTICLE_CREATED } from '../../src/events/';

import chai from 'chai';
import sinon from 'sinon';

const { spy } = sinon;
const { assert } = chai;
const { Emitter } = Proton;
const TODO = new Error('TODO');

describe('emitter -> Emitter', () => {
  it('should instantiate with the correct properties', done => {
    const emitter = new Emitter();

    const {
      particles,
      initializers,
      behaviours,
      currentEmitTime,
      totalEmitTimes,
      damping,
      bindEmitter,
      rate,
      id,
      eventDispatcher
    } = emitter;

    assert.isArray(particles);
    assert.isEmpty(particles);
    assert.isArray(initializers);
    assert.isEmpty(initializers);
    assert.isArray(behaviours);
    assert.isEmpty(behaviours);
    assert.equal(currentEmitTime, 0);
    assert.equal(totalEmitTimes, -1);
    assert.equal(damping, DEFAULT_DAMPING);
    assert.equal(bindEmitter, DEFAULT_BIND_EMITTER);
    assert.equal(rate, DEFAULT_EMITTER_RATE);
    assert.isString(id);
    assert.instanceOf(eventDispatcher, EventDispatcher);

    done();
  });

  it('should set the emitter rate and return the emitter', done => {
    const emitter = new Emitter();
    const rate = new Proton.Rate(1, 2);

    assert.instanceOf(emitter.setRate(rate), Emitter);

    const { numPan, timePan } = emitter.rate;

    assert.equal(numPan.a, 1);
    assert.equal(numPan.b, 1);
    assert.equal(timePan.a, 2);
    assert.equal(timePan.b, 2);

    done();
  });

  it('should set the emitter postion and return the emitter', done => {
    const emitter = new Emitter();
    const position = { x: 4, y: 2, z: 9 };

    assert.instanceOf(emitter.setPosition(position), Emitter);

    const { p } = emitter;
    const { x, y, z } = position;

    assert.deepEqual(Object.values(p), [x, y, z]);

    done();
  });

  it('should set the the totalEmitTimes and life and call the rate init method', done => {
    const emitter = new Emitter();
    const rateInitSpy = spy(emitter.rate, 'init');

    emitter.emit(5, 11);

    const { currentEmitTime, totalEmitTimes, life } = emitter;

    assert.equal(currentEmitTime, 0);
    assert.equal(totalEmitTimes, 5);
    assert.equal(life, 11);

    assert(rateInitSpy.calledOnce);

    rateInitSpy.restore();

    done();
  });

  it('should set the life to 1 if the totalEmitTimes is 1', done => {
    const emitter = new Emitter();

    emitter.emit(1, 1002);

    assert.equal(emitter.totalEmitTimes, 1);
    assert.equal(emitter.life, 1);

    done();
  });

  it('should set the correct properties to stop particles emitting', done => {
    const emitter = new Emitter();

    emitter.emit(5, 11).stopEmit();

    assert.equal(emitter.currentEmitTime, 0);
    assert.equal(emitter.totalEmitTimes, -1);

    done();
  });

  it('should kill all of the emitter\'s particles', done => {
    const emitter = new Emitter();

    for (let i = 0; i < 500; i++) {
      emitter.particles.push(new Proton.Particle());
    }

    emitter.removeAllParticles();
    emitter.particles.forEach(particle => assert.isTrue(particle.dead));

    done();
  });

  it('should get a particle from the pool, call the setupParticle method, dispatch events and return the particle', done => {
    const proton = new Proton.Proton();
    const emitter = new Emitter();
    const initializer = new Proton.Mass();
    const behaviour = new Proton.Attraction();
    const setupParticleSpy = spy(emitter, 'setupParticle');
    const protonDispatchSpy = spy(proton, 'dispatch');
    const emitterDispatchSpy = spy(emitter, 'dispatch');
    const spies = [setupParticleSpy, protonDispatchSpy, emitterDispatchSpy];

    proton.addEmitter(emitter);

    const particle = emitter.createParticle(initializer, behaviour);

    assert.instanceOf(particle, Proton.Particle);
    assert(setupParticleSpy.calledOnceWith(particle, initializer, behaviour));
    assert(protonDispatchSpy.secondCall.calledWith(PARTICLE_CREATED, particle));
    assert(emitterDispatchSpy.notCalled);

    spies.forEach(spy => spy.restore());
    done();
  });

  it('should call the emitter\'s dispatch when creating a particle with bindEmitterEvent set to true', done => {
    const proton = new Proton.Proton();
    const emitter = new Emitter();
    const emitterDispatchSpy = spy(emitter, 'dispatch');
    const spies = [emitterDispatchSpy];

    proton.addEmitter(emitter);
    emitter.bindEmitterEvent = true;

    const particle = emitter.createParticle(
      new Proton.Mass(),
      new Proton.Attraction()
    );

    assert(emitterDispatchSpy.calledOnceWith(PARTICLE_CREATED, particle));

    spies.forEach(spy => spy.restore());
    done();
  });

  it('should add an initializer to the emitter', done => {
    const emitter = new Emitter();
    const mass = new Proton.Mass();

    assert.instanceOf(emitter.addInitializer(mass), Emitter);
    assert.notEmpty(emitter.initializers);
    assert.instanceOf(emitter.initializers[0], Proton.Mass);

    done();
  });

  it('should add all the initializers passed', done => {
    const emitter = new Emitter();
    const mass = new Proton.Mass();
    const life = new Proton.Life();
    const radius = new Proton.Radius();
    const initializers = [mass, life, radius];

    assert.instanceOf(emitter.addInitializers(initializers), Emitter);
    assert.lengthOf(emitter.initializers, initializers.length);
    assert.instanceOf(emitter.initializers[0], Proton.Radius);
    assert.instanceOf(emitter.initializers[1], Proton.Life);
    assert.instanceOf(emitter.initializers[2], Proton.Mass);

    done();
  });

  it('should set the emitter initializers to the initializers passed', done => {
    const emitter = new Emitter();
    const mass = new Proton.Mass();
    const life = new Proton.Life();
    const radius = new Proton.Radius();
    const initializers = [mass, life, radius];

    assert.instanceOf(emitter.setInitializers(initializers), Emitter);
    assert.deepEqual(emitter.initializers, initializers);

    done();
  });

  it('should remove the initializer', done => {
    const emitter = new Emitter();
    const mass = new Proton.Mass();
    const life = new Proton.Life();

    emitter.addInitializers([mass, life]);

    assert.lengthOf(emitter.initializers, 2);

    emitter.removeInitializer(mass);

    assert.lengthOf(emitter.initializers, 1);
    assert.instanceOf(emitter.initializers[0], Proton.Life);

    done();
  });

  it('should remove all the initializers from the emitter', done => {
    const emitter = new Emitter();
    const mass = new Proton.Mass();
    const life = new Proton.Life();
    const radius = new Proton.Radius();
    const initializers = [mass, life, radius];

    emitter.addInitializers(initializers);

    assert.instanceOf(emitter.removeAllInitializers(), Emitter);
    assert.lengthOf(emitter.initializers, 0);

    done();
  });

  it('should add a behaviour to the emitter', done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();

    assert.instanceOf(emitter.addBehaviour(attraction), Emitter);
    assert.lengthOf(emitter.behaviours, 1);
    assert.deepEqual(emitter.behaviours[0], attraction);

    done();
  });

  it('should add all the behaviours to the emitter', done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];

    assert.instanceOf(emitter.addBehaviours(behaviours), Emitter);
    assert.lengthOf(emitter.behaviours, behaviours.length);
    assert.instanceOf(emitter.behaviours[0], Proton.Gravity);
    assert.instanceOf(emitter.behaviours[1], Proton.Repulsion);
    assert.instanceOf(emitter.behaviours[2], Proton.Attraction);

    done();
  });

  it('should set the emitter behaviours to the behaviours passed', done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];

    assert.instanceOf(emitter.setBehaviours(behaviours), Emitter);
    assert.lengthOf(emitter.behaviours, behaviours.length);
    assert.deepEqual(emitter.behaviours, behaviours);

    done();
  });

  it('should remove all emitter behaviours', done => {
    const emitter = new Emitter();

    emitter.setBehaviours([
      new Proton.Attraction(),
      new Proton.Repulsion(),
      new Proton.Gravity()
    ]);

    assert.instanceOf(emitter.removeAllBehaviours(), Emitter);
    assert.empty(emitter.behaviours);

    done();
  });

  it('should get a particle from the pool when creating the particle and return the particle', done => {
    done(TODO);
  });

  it('should call the setupParticle method on the particle when creating it', done => {
    done(TODO);
  });

  it('should dispatch the correct events when creating a particle', done => {
    done(TODO);
  });

  it('should call the InitializerUtil.initialize method on the particle passing the correct arguments', done => {
    done(TODO);
  });

  it('should set the particle beahviours as well as its parent and push the particle into the emitter.particles array', done => {
    done(TODO);
  });

  it('should destroy the emitter', done => {
    done(TODO);
  });
});

describe('emitter -> Emitter -> update', () => {
  it('should set the emitter age according to the time passed', done => {
    done(TODO);
  });

  it('should destroy the emitter if the emitter is dead', done => {
    done(TODO);
  });

  it('should call the generate and integrate methods, passing the update time argument to both', done => {
    done(TODO);
  });

  it('should destroy the emitter if the emitter age is >= to its life', done => {
    done(TODO);
  });

  it('should call the required methods while updating the emitter if a particle is dead', done => {
    done(TODO);
  });
});

describe('emitter -> Emitter -> integrate', () => {
  it('should call the integrator\'s integrate method passing the correct arguments', done => {
    done(TODO);
  });

  it('should update and integrate each particle', done => {
    done(TODO);
  });

  it('should dispatch the correct events after updating particles', done => {
    done(TODO);
  });
});

describe('emitter -> Emitter -> generate', () => {
  it('should set the cID, call createParticle the right number of times and set the totalEmitTimes to 0 if the totalEmitTimes was 1', done => {
    done(TODO);
  });

  it('should set the currentEmitTime', done => {
    done(TODO);
  });

  it('should create the correct number of particles if currentEmitTime < totalEmitTimes', done => {
    done(TODO);
  });
});
