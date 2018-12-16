/*global describe, it */

import * as Proton from '../../src';

import Particles from '../../src/core/Proton';
import chai from 'chai';
import containsInvalidBehaviour from './fixtures/json/containsInvalidBehaviour.json';
import containsInvalidInitializer from './fixtures/json/containsInvalidInitializer.json';
import containsInvalidZoneType from './fixtures/json/containsInvalidZoneType.json';
import domino from 'domino';
import eightdiagrams from './fixtures/json/eightdiagrams.json';

const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('fromJSON', () => {
  it('should return a proton instance', done => {
    const proton = Particles.fromJSON({});

    assert.instanceOf(proton, Proton.Proton);

    done();
  });

  it('should instantiate the eightdiagrams example from JSON', done => {
    const proton = Particles.fromJSON(eightdiagrams);

    assert.lengthOf(proton.emitters, eightdiagrams.emitters.length);
    assert.lengthOf(
      proton.emitters[0].initializers,
      eightdiagrams.emitters[0].initializers.length
    );
    assert.lengthOf(
      proton.emitters[1].initializers,
      eightdiagrams.emitters[1].initializers.length
    );
    assert.lengthOf(
      proton.emitters[0].behaviours,
      eightdiagrams.emitters[0].behaviours.length
    );
    assert.lengthOf(
      proton.emitters[1].behaviours,
      eightdiagrams.emitters[1].behaviours.length
    );

    assert.equal(proton.emitters[0].p.x, eightdiagrams.emitters[0].position.x);
    assert.equal(proton.emitters[1].p.x, eightdiagrams.emitters[1].position.x);

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
