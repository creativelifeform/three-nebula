/*global describe, it */

import * as Proton from '../../../src';

import Initialize from '../../../src/initialize/Initialize';
import chai from 'chai';

const { assert } = chai;

describe('property -> Property', () => {
  it('should have the required methods after instantiation', done => {
    const initialize = new Initialize();

    assert.isFunction(initialize.init);
    assert.isFunction(initialize.reset);
    assert.isFunction(initialize.initialize);

    done();
  });
  it('should initialize the emitter', done => {
    const emitter = new Proton.Emitter();
    const initialize = new Initialize();

    initialize.init(emitter);

    assert.isTrue(emitter.hasBeenInitialized);

    done();
  });

  it('should initialize the particle', done => {
    const emitter = new Proton.Emitter();
    const particle = new Proton.Particle();
    const initialize = new Initialize();

    initialize.init(emitter, particle);

    assert.isFalse(emitter.hasBeenInitialized);
    assert.isTrue(particle.hasBeenInitialized);

    done();
  });
});
