/*global describe, it */

import * as Nebula from '../../src';

import Particles from '../../src/core/System';
import chai from 'chai';
import containsEmitterBehaviours from './fixtures/json/containsEmitterBehaviours.json';
import containsInvalidBehaviour from './fixtures/json/containsInvalidBehaviour.json';
import containsInvalidInitializer from './fixtures/json/containsInvalidInitializer.json';
import containsInvalidZoneType from './fixtures/json/containsInvalidZoneType.json';
import containsTotalEmitTimes from './fixtures/json/containsTotalEmitTimes.json';
import domino from 'domino';
import eightdiagrams from './fixtures/json/eightdiagrams.json';

const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('fromJSON', () => {
  it('should return a system instance', done => {
    const system = Particles.fromJSON({});

    assert.instanceOf(system, Nebula.System);

    done();
  });

  it('should instantiate the eightdiagrams example from JSON', done => {
    const system = Particles.fromJSON(eightdiagrams);

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

    done();
  });

  it('should instantiate and set the total emit times and life to 1 on the emitter', done => {
    const system = Particles.fromJSON(containsTotalEmitTimes);
    const emitter = system.emitters[0];

    assert.equal(emitter.totalEmitTimes, 1);
    assert.equal(emitter.life, 1);

    done();
  });

  it('should set the emitter behaviours', done => {
    const system = Particles.fromJSON(containsEmitterBehaviours);
    const emitter = system.emitters[0];

    assert.notEmpty(emitter.emitterBehaviours);
    assert.lengthOf(emitter.emitterBehaviours, 1);

    done();
  });

  it('should throw an error if an invalid initializer type is supplied', done => {
    assert.throws(
      () => Particles.fromJSON(containsInvalidInitializer),
      Error,
      'The initializer type MrDoob is invalid or not yet supported'
    );

    done();
  });

  it('should throw an error if an invalid behavour type is supplied', done => {
    assert.throws(
      () => Particles.fromJSON(containsInvalidBehaviour),
      Error,
      'The behaviour type MrDoob is invalid or not yet supported'
    );

    done();
  });

  it('should throw an error if an invalid zoneType is supplied as a position initializer property', done => {
    assert.throws(
      () => Particles.fromJSON(containsInvalidZoneType),
      Error,
      'The zone type MrDoob is invalid or not yet supported'
    );

    done();
  });
});
