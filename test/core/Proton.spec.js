/*global describe, it */

import * as Proton from '../../src';

import { EULER, POOL_MAX } from '../../src/constants';
import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PROTON_UPDATE,
  PROTON_UPDATE_AFTER
} from '../../src/events';

import { Scene } from 'three';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const System = Proton.Proton;
const { values, keys } = Object;
const { spy } = sinon;

// TODO Currently having issues testing the event dispatches, not sure why
// but Sinon seems unable to spy the EventDispatcher's dispatchEvent method
// properly.

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
    assert.equal(integrationType, EULER);
    assert.isArray(emitters);
    assert.isEmpty(emitters);
    assert.isArray(renderers);
    assert.isEmpty(renderers);
    assert.instanceOf(pool, Proton.Pool);
    assert.instanceOf(eventDispatcher, EventDispatcher);

    done();
  });

  it('should return an integrator from the static integrator method', done => {
    assert.instanceOf(System.integrator(), Proton.Integration);

    done();
  });

  it('should add a renderer', done => {
    const proton = new System();
    const renderer = new Proton.SpriteRenderer();

    proton.addRenderer(renderer);

    assert.notEmpty(proton.renderers);
    assert.instanceOf(proton.renderers[0], Proton.SpriteRenderer);

    done();
  });

  it('should remove the renderer', done => {
    const proton = new System();
    const renderer = new Proton.SpriteRenderer();

    proton.addRenderer(renderer);
    proton.removeRenderer(renderer);

    assert.isEmpty(proton.renderers);

    done();
  });

  it('should add an emitter', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();

    proton.addEmitter(emitter);

    assert.isNotEmpty(proton.emitters);
    assert.instanceOf(proton.emitters[0], Proton.Emitter);

    done();
  });

  it('should remove an emitter', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();

    proton.addEmitter(emitter);
    proton.removeEmitter(emitter);

    assert.isEmpty(proton.emitters);

    done();
  });

  it('should call the update method for all emitters and also dispatch the required events', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();
    const emitterSpy = spy(emitter, 'update');

    proton.addEmitter(emitter);
    proton.update();

    assert(emitterSpy.calledOnce);

    emitterSpy.restore();

    done();
  });

  it('should get the count of particles in the system', done => {
    const proton = new System();
    const emitter = new Proton.Emitter();

    emitter
      .setRate(
        new Proton.Rate(new Proton.Span(100, 200), new Proton.Span(0.01, 0.01))
      )
      .setProperties([
        new Proton.Mass(1),
        new Proton.Life(2),
        new Proton.Radius(80),
        new Proton.Velocity(200, new Proton.Vector3D(0, 0, -1), 0)
      ])
      .setBehaviours([
        new Proton.Alpha(1, 0),
        new Proton.Scale(1, 0.5),
        new Proton.Force(0, 0, -20)
      ]);

    proton.addRenderer(new Proton.SpriteRenderer(new Scene()));
    proton.addEmitter(emitter.emit());
    proton.update().then(() => {
      setTimeout(() => {
        assert.notEqual(proton.getCount(), 0);
        done();
      }, 1500);
    });
  });
});
