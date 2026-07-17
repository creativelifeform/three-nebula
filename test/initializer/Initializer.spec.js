
import * as Nebula from '../../src';

import Initializer from '../../src/initializer/Initializer';
import chai from 'chai';

const { assert } = chai;

describe('initializer -> Initializer', () => {
  it('should have the required methods after instantiation', () => {
    const initializer = new Initializer();

    assert.equal(initializer.type, 'Initializer');
    assert.isFunction(initializer.init);
    assert.isFunction(initializer.reset);
    assert.isFunction(initializer.initialize);

  });
  it('should initialize the emitter', () => {
    const emitter = new Nebula.Emitter();
    const initializer = new Initializer();

    initializer.init(emitter);

    assert.isTrue(emitter.hasBeenInitialized);

  });

  it('should initialize the particle', () => {
    const emitter = new Nebula.Emitter();
    const particle = new Nebula.Particle();
    const initializer = new Initializer();

    initializer.init(emitter, particle);

    assert.isUndefined(emitter.hasBeenInitialized);
    assert.isTrue(particle.hasBeenInitialized);

  });

  it('should not initialize the particle if the initializer is disabled', () => {
    const particle = new Nebula.Particle();
    const initializer = new Initializer('test', false);

    initializer.init(null, particle);

    assert.isUndefined(particle.hasBeenInitialized);

  });
});
