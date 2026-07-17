
import * as Nebula from '../../src';

import Velocity from '../../src/initializer/Velocity/Velocity';
import chai from 'chai';

const { assert } = chai;

describe('initializer -> Velocity abstract', () => {
  const velocity = new Velocity();

  it('should set the dirVec property', () => {
    assert.instanceOf(velocity.dirVec, Nebula.Vector3D);

  });

  it('should have the normalize method', () => {
    assert.isFunction(velocity.normalize);

  });
});
