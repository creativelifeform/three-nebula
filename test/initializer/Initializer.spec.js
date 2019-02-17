/*global describe, it */

import * as Proton from '../../src';

import Initializer from '../../src/initializer/Initializer';
import chai from 'chai';

const { assert } = chai;

describe('initializer -> Initializer', () => {
  it('should have the required methods after instantiation', done => {
    const initializer = new Initializer();

    assert.equal(initializer.type, 'Initializer');
    assert.isFunction(initializer.init);
    assert.isFunction(initializer.reset);
    assert.isFunction(initializer.initialize);

    done();
  });
  it('should initialize the emitter', done => {
    const emitter = new Proton.Emitter();
    const initializer = new Initializer();

    initializer.init(emitter);

    assert.isTrue(emitter.hasBeenInitialized);

    done();
  });

  it('should initialize the particle', done => {
    const emitter = new Proton.Emitter();
    const particle = new Proton.Particle();
    const initializer = new Initializer();

    initializer.init(emitter, particle);

    assert.isUndefined(emitter.hasBeenInitialized);
    assert.isTrue(particle.hasBeenInitialized);

    done();
  });

  it('should not initialize the particle if the initializer is disabled', done => {
    const particle = new Proton.Particle();
    const initializer = new Initializer('test', false);

    initializer.init(null, particle);

    assert.isUndefined(particle.hasBeenInitialized);

    done();
  });
});
