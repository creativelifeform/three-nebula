/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Polar Velocity', () => {
  const polar3d = new Proton.Polar3D(4, 9, 2);
  const velocity = new Proton.PolarVelocity(polar3d, 9);
  const particle = new Proton.Particle();

  it('should set the correct properties', done => {
    const { tha, dirVec, _useV, radiusPan, dir } = velocity;

    assert.equal(tha, 0.1571);
    assert.instanceOf(dirVec, Proton.Vector3D);
    assert.deepEqual(Object.values(dirVec), [
      -0.6860072156638288,
      -1.4989531127105078,
      -3.6445210475387078
    ]);
    assert.isUndefined(radiusPan);
    assert.isUndefined(dir);
    assert.isFalse(_useV);

    done();
  });

  it('should set the particle velocity', done => {
    velocity.initialize(particle);

    const {
      v,
      v: { x, y, z }
    } = particle;

    assert.instanceOf(v, Proton.Vector3D);
    assert.notEqual(x, 0);
    assert.notEqual(y, 0);
    assert.notEqual(z, 0);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.PolarVelocity.fromJSON({
      polarRadius: 1,
      polarTheta: 0.96,
      polarPhi: 0.88,
      velocityTheta: 0.45
    });

    assert.instanceOf(instance, Proton.PolarVelocity);
    assert.instanceOf(instance.dirVec, Proton.Vector3D);
    assert.equal(instance.tha, 0.007855);
    assert.deepEqual(Object.values(instance.dirVec), [
      0.5219488450608104,
      -0.6313827909557999,
      0.5735199860724567
    ]);

    done();
  });
});
