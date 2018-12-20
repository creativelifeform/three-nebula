/*global describe, it */

import * as Proton from '../../src';

import Velocity from '../../src/initializer/Velocity/Velocity';
import chai from 'chai';

const { assert } = chai;

describe('initializer -> Velocity abstract', () => {
  const velocity = new Velocity();

  it('should set the dirVec property', done => {
    assert.instanceOf(velocity.dirVec, Proton.Vector3D);

    done();
  });

  it('should have the normalize method', done => {
    assert.isFunction(velocity.normalize);

    done();
  });
});
