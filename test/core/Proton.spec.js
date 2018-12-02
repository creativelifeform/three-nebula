/*global describe, it */

import * as Proton from '../../src';

import { EULER, POOL_MAX } from '../../src/constants';

import EventDispatcher from '../../src/events';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const System = Proton.Proton;
const { values, keys } = Object;
const { spy } = sinon;

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
});
