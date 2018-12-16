/*global describe, it */

import * as Proton from '../../src';

import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PROTON_UPDATE,
  PROTON_UPDATE_AFTER
} from '../../src/events';

import { INTEGRATION_TYPE_EULER } from '../../src/math';
import { POOL_MAX } from '../../src/constants';
import { Scene } from 'three';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const System = Proton.Proton;

describe('core -> Proton', () => {
  it('should instantiate with the correct properties', done => {
    const {
      preParticles,
      integrationType,
      emitters,
      renderers,
      pool,
      eventDispatcher
    } = new System();

    assert.equal(preParticles, POOL_MAX);
    assert.equal(integrationType, INTEGRATION_TYPE_EULER);
    assert.isArray(emitters);
    assert.isEmpty(emitters);
    assert.isArray(renderers);
    assert.isEmpty(renderers);
    assert.instanceOf(pool, Proton.Pool);
    assert.instanceOf(eventDispatcher, EventDispatcher);

    done();
  });

  it('should add a renderer', done => {
    const proton = new System();
    const renderer = new Proton.SpriteRenderer();

    assert.instanceOf(proton.addRenderer(renderer), System);
    assert.notEmpty(proton.renderers);
    assert.instanceOf(proton.renderers[0], Proton.SpriteRenderer);

    done();
  });

  it('should remove the renderer', done => {
    const proton = new System();
    const renderer = new Proton.SpriteRenderer();

    proton.addRenderer(renderer).removeRenderer(renderer);

    assert.isEmpty(proton.renderers);

    done();
  });

  it('should add an emitter and dispatch the EMITTER_ADDED', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const spy = sinon.spy(proton, 'dispatch');

    assert.instanceOf(proton.addEmitter(emitter), System);
    assert.isNotEmpty(proton.emitters);
    assert.instanceOf(proton.emitters[0], Proton.Emitter);
    assert(spy.calledOnce);
    assert(spy.calledWith(EMITTER_ADDED, emitter));

    spy.restore();
    done();
  });

  it('should remove an emitter and dispatch the EMITTER_REMOVED event', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const spy = sinon.spy(proton, 'dispatch');

    proton.addEmitter(emitter);
    proton.removeEmitter(emitter);
    assert.isEmpty(proton.emitters);
    assert(spy.calledTwice);
    assert(spy.secondCall.calledWith(EMITTER_REMOVED, emitter));

    spy.restore();

    done();
  });

  it('should not remove an emitter that is not a child of the proton instance', done => {
    const proton = new System();
    const emitterA = new Proton.Emitter();
    const emitterB = new Proton.Emitter();

    proton.addEmitter(emitterA);
    proton.removeEmitter(emitterB);

    assert.lengthOf(proton.emitters, 1);
    assert.equal(emitterA.id, proton.emitters[0].id);

    done();
  });

  it('should call the update method for all emitters and also dispatch the required events', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const emitterSpy = sinon.spy(emitter, 'update');
    const dispatchSpy = sinon.spy(proton, 'dispatch');

    proton.addEmitter(emitter);
    proton.update();

    assert(emitterSpy.calledOnce);
    // proton.addEmitter x1 + proton.update x2
    assert(dispatchSpy.calledThrice);
    assert(dispatchSpy.secondCall.calledWith(PROTON_UPDATE));
    assert(dispatchSpy.thirdCall.calledWith(PROTON_UPDATE_AFTER));

    emitterSpy.restore();
    dispatchSpy.restore();

    done();
  });

  it('should get the count of particles in the system', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const rate = new Proton.Rate(500, 0.01);
    const renderer = new Proton.SpriteRenderer(new Scene());

    proton
      .addRenderer(renderer)
      .addEmitter(emitter.setRate(rate).emit())
      .update()
      .then(() => {
        setTimeout(() => {
          assert.notEqual(proton.getCount(), 0);
          done();
        }, 1500);
      });
  });

  it('should destroy all emitters and the empty the pool', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const rate = new Proton.Rate(500, 0.01);
    const renderer = new Proton.SpriteRenderer(new Scene());

    proton
      .addRenderer(renderer)
      .addEmitter(emitter.setRate(rate).emit())
      .update();

    setTimeout(() => {
      proton.destroy();

      assert.isEmpty(proton.emitters);
      assert.isEmpty(proton.pool.list);

      done();
    }, 500);
  });
});
