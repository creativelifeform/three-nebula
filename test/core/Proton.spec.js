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
});
