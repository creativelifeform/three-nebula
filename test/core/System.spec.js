/*global describe, it */

import * as Nebula from '../../src';
import * as THREE from 'three';

import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  SYSTEM_UPDATE,
  SYSTEM_UPDATE_AFTER,
} from '../../src/events';

import { INTEGRATION_TYPE_EULER } from '../../src/math';
import { POOL_MAX } from '../../src/constants';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const System = Nebula.System;
const getSystem = () => new System();
const getSpriteRenderer = container =>
  new Nebula.SpriteRenderer(THREE, container);
const { Scene } = THREE;

describe('core -> System', () => {
  it('should instantiate with the correct properties', done => {
    const {
      type,
      preParticles,
      integrationType,
      emitters,
      renderers,
      pool,
      eventDispatcher,
    } = getSystem();

    assert.equal(type, 'System');
    assert.equal(preParticles, POOL_MAX);
    assert.equal(integrationType, INTEGRATION_TYPE_EULER);
    assert.isArray(emitters);
    assert.isEmpty(emitters);
    assert.isArray(renderers);
    assert.isEmpty(renderers);
    assert.instanceOf(pool, Nebula.Pool);
    assert.instanceOf(eventDispatcher, EventDispatcher);

    done();
  });

  it('should add a renderer', done => {
    const system = getSystem();
    const renderer = getSpriteRenderer();

    assert.instanceOf(system.addRenderer(renderer), System);
    assert.notEmpty(system.renderers);
    assert.instanceOf(system.renderers[0], Nebula.SpriteRenderer);

    done();
  });

  it('should remove the renderer', done => {
    const system = getSystem();
    const renderer = getSpriteRenderer();

    system.addRenderer(renderer).removeRenderer(renderer);

    assert.isEmpty(system.renderers);

    done();
  });

  it('should add an emitter and dispatch the EMITTER_ADDED', done => {
    const system = getSystem();
    const emitter = new Nebula.Emitter();
    const spy = sinon.spy(system, 'dispatch');

    assert.instanceOf(system.addEmitter(emitter), System);
    assert.isNotEmpty(system.emitters);
    assert.instanceOf(system.emitters[0], Nebula.Emitter);
    assert(spy.calledOnce);
    assert(spy.calledWith(EMITTER_ADDED, emitter));

    spy.restore();
    done();
  });

  it('should remove an emitter and dispatch the EMITTER_REMOVED event', done => {
    const system = getSystem();
    const emitter = new Nebula.Emitter();
    const spy = sinon.spy(system, 'dispatch');

    system.addEmitter(emitter);
    system.removeEmitter(emitter);
    assert.isEmpty(system.emitters);
    assert(spy.calledTwice);
    assert(spy.secondCall.calledWith(EMITTER_REMOVED, emitter));

    spy.restore();

    done();
  });

  it('should not remove an emitter that is not a child of the system instance', done => {
    const system = getSystem();
    const emitterA = new Nebula.Emitter();
    const emitterB = new Nebula.Emitter();

    system.addEmitter(emitterA);
    system.removeEmitter(emitterB);

    assert.lengthOf(system.emitters, 1);
    assert.equal(emitterA.id, system.emitters[0].id);

    done();
  });

  it('should call the update method for all emitters and also dispatch the required events', done => {
    const system = getSystem();
    const emitter = new Nebula.Emitter();
    const emitterSpy = sinon.spy(emitter, 'update');
    const dispatchSpy = sinon.spy(system, 'dispatch');

    system.addEmitter(emitter);
    system.update();

    assert(emitterSpy.calledOnce);
    // system.addEmitter x1 + system.update x2
    assert(dispatchSpy.calledThrice);
    assert(dispatchSpy.secondCall.calledWith(SYSTEM_UPDATE));
    assert(dispatchSpy.thirdCall.calledWith(SYSTEM_UPDATE_AFTER));

    emitterSpy.restore();
    dispatchSpy.restore();

    done();
  });

  it('should not dispatch from within the update method if the canUpdate prop is set to false', done => {
    const proton = getSystem();
    const emitter = new Nebula.Emitter();

    proton.canUpdate = false;
    proton.addEmitter(emitter);

    // add spies here so that the dispatch in addEmitter isn't spied on
    const emitterUpdateSpy = sinon.spy(emitter, 'update');
    const dispatchSpy = sinon.spy(proton, 'dispatch');

    proton.update();

    assert(dispatchSpy.notCalled);
    assert(emitterUpdateSpy.notCalled);

    dispatchSpy.restore();
    emitterUpdateSpy.restore();

    done();
  });

  it('should get the count of particles in the system', done => {
    const system = getSystem();
    const emitter = new Nebula.Emitter();
    const rate = new Nebula.Rate(500, 0.01);
    const renderer = getSpriteRenderer(new Scene());

    system
      .addRenderer(renderer)
      .addEmitter(emitter.setRate(rate).emit())
      .update()
      .then(() => {
        setTimeout(() => {
          assert.notEqual(system.getCount(), 0);
          done();
        }, 1500);
      });
  });

  it('should destroy all emitters and the empty the pool', done => {
    const system = getSystem();
    const emitter = new Nebula.Emitter();
    const rate = new Nebula.Rate(500, 0.01);
    const renderer = getSpriteRenderer(new Scene());

    system
      .addRenderer(renderer)
      .addEmitter(emitter.setRate(rate).emit())
      .update();

    setTimeout(() => {
      system.destroy();

      assert.isEmpty(system.emitters);
      assert.isEmpty(system.pool.list);

      done();
    }, 500);
  });
});
