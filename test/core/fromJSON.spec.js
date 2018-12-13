/*global describe, it */

import * as Proton from '../../src';

import Particles from '../../src/core/Proton';
import chai from 'chai';
import eightdiagrams from './fixtures/eightdiagrams.json';

const { assert } = chai;

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
});
