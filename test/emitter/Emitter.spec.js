/*global describe, it */

import * as Proton from '../../src';

import {
  DEFAULT_BIND_EMITTER,
  DEFAULT_DAMPING,
  DEFAULT_EMITTER_RATE
} from '../../src/emitter/constants';

import EventDispatcher from '../../src/events/EventDispatcher';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const { Emitter } = Proton;

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
});
