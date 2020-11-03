/*global describe, it, before, after */

import * as THREE from 'three';

import Emitter from '../../src/emitter/Emitter';
import Particles from '../../src/core/System';
import Texture from '../../src/initializer/Texture';
import chai from 'chai';
import domino from 'domino';
import eightdiagrams from './fixtures/json/eightdiagramsAsync.json';
import hasEmitterBehavioursWithLifeNull from './fixtures/json/hasEmitterBehavioursWithLifeNull.json';
import hasEmitterWithLifeNull from './fixtures/json/hasEmitterWithLifeNull.json';
import hasEmitterWithTotalEmitTimesNull from './fixtures/json/hasEmitterWithTotalEmitTimesNull.json';
import sinon from 'sinon';

const { TextureLoader } = THREE;
const { stub, spy } = sinon;
const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('fromJSONAsync', () => {
  let textureLoaderStub, consoleWarnStub;

  before(() => {
    // stop three warns from being printed, these happen because we're stubbing
    // things below
    consoleWarnStub = stub(console, 'warn');
    textureLoaderStub = stub(
      TextureLoader.prototype,
      'load'
    ).callsFake((texture, callback) => callback());
  });

  after(() => {
    textureLoaderStub.restore();
    consoleWarnStub.restore();
  });

  it('should call the Texture initializer fromJSON method if the properties contain a texture', async () => {
    const fromJSONSpy = spy(Texture, 'fromJSON');

    await Particles.fromJSONAsync(eightdiagrams, THREE);

    assert(fromJSONSpy.calledTwice);

    fromJSONSpy.restore();
  });

  it('should instantiate the eightdiagramsAsync example', async () => {
    const system = await Particles.fromJSONAsync(eightdiagrams, THREE);

    assert.lengthOf(system.emitters, eightdiagrams.emitters.length);
    assert.lengthOf(
      system.emitters[0].initializers,
      eightdiagrams.emitters[0].initializers.length
    );
    assert.lengthOf(
      system.emitters[1].initializers,
      eightdiagrams.emitters[1].initializers.length
    );
    assert.lengthOf(
      system.emitters[0].behaviours,
      eightdiagrams.emitters[0].behaviours.length
    );
    assert.lengthOf(
      system.emitters[1].behaviours,
      eightdiagrams.emitters[1].behaviours.length
    );

    assert.equal(
      system.emitters[0].position.x,
      eightdiagrams.emitters[0].position.x
    );
    assert.equal(
      system.emitters[1].position.x,
      eightdiagrams.emitters[1].position.x
    );
    assert.equal(
      system.emitters[0].rotation.x,
      eightdiagrams.emitters[0].rotation.x
    );
    assert.equal(
      system.emitters[0].rotation.y,
      eightdiagrams.emitters[0].rotation.y
    );
    assert.equal(
      system.emitters[0].rotation.z,
      eightdiagrams.emitters[0].rotation.z
    );
  });

  it('should set null life for the emitter as Infinity when emitting', async () => {
    const system = await Particles.fromJSONAsync(hasEmitterWithLifeNull, THREE);
    const emitter = system.emitters[0];

    assert.equal(emitter.life, Infinity);
  });

  it('should instantiate null totalEmitTimes for the emitter as Infinity', async () => {
    const system = await Particles.fromJSON(
      hasEmitterWithTotalEmitTimesNull,
      THREE
    );
    const emitter = system.emitters[0];

    assert.equal(emitter.totalEmitTimes, Infinity);
  });

  it("should instantiate null life for the emitter's behaviours as Infinity", async () => {
    const system = await Particles.fromJSON(
      hasEmitterBehavioursWithLifeNull,
      THREE
    );
    const emitter = system.emitters[0];
    const behaviours = emitter.behaviours;

    behaviours.forEach(behaviour => {
      assert.equal(behaviour.life, Infinity);
    });
  });

  it("should call an emitter's emit method if shouldAutoEmit option is true", async () => {
    const emitSpy = spy(Emitter.prototype, 'emit');

    await Particles.fromJSONAsync(eightdiagrams, THREE, {
      shouldAutoEmit: true,
    });

    assert(emitSpy.called);

    emitSpy.restore();
  });

  it('should default to shouldAutoEmit is true', async () => {
    const emitSpy = spy(Emitter.prototype, 'emit');

    await Particles.fromJSONAsync(eightdiagrams, THREE);

    assert(emitSpy.called);

    emitSpy.restore();
  });

  it("should not ever call an emitter's emit method if shouldAutoEmit option is false", async () => {
    const emitSpy = spy(Emitter.prototype, 'emit');

    await Particles.fromJSONAsync(eightdiagrams, THREE, {
      shouldAutoEmit: false,
    });

    assert(emitSpy.notCalled);

    emitSpy.restore();
  });

  it("should call the emitter's setTotalEmitTimes and setLife methods if the shouldAutoEmit option is false", async () => {
    const setTotalEmitTimesSpy = spy(Emitter.prototype, 'setTotalEmitTimes');
    const setLifeSpy = spy(Emitter.prototype, 'setLife');

    await Particles.fromJSONAsync(eightdiagrams, THREE, {
      shouldAutoEmit: false,
    });

    assert(setTotalEmitTimesSpy.called);
    assert(setLifeSpy.called);

    setTotalEmitTimesSpy.restore();
    setLifeSpy.restore();
  });
});
