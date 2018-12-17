/*global describe, it */

import * as Proton from '../../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Radial Velocity', () => {
  const radius = 13;
  const vector3d = new Proton.Vector3D(1, 2, 1);
  const velocity = new Proton.RadialVelocity(radius, vector3d, 5);
  const particle = new Proton.Particle();

  it('should set the correct properties', done => {
    const {
      radiusPan: { a, b },
      dir: { x, y, z },
      tha,
      _useV,
      dirVec
    } = velocity;

    assert.equal(a, 13);
    assert.equal(b, 13);
    assert.equal(x, 0.4082482904638631);
    assert.equal(y, 0.8164965809277261);
    assert.equal(z, 0.4082482904638631);
    assert.equal(tha, 0.08727777777777777);
    assert.isTrue(_useV);
    assert.instanceOf(dirVec, Proton.Vector3D);
    assert.deepEqual(Object.values(dirVec), [0, 0, 0]);

    done();
  });

  it('should set the particle velocity', done => {
    velocity.initialize(particle);

    const {
      v,
      v: { x, y, z }
    } = particle;

    assert.instanceOf(v, Proton.Vector3D);
    assert.isAbove(x, 0);
    assert.isAbove(y, 0);
    assert.isAbove(z, 0);

    done();
  });
});
