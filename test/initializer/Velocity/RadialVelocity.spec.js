/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Radial Velocity', () => {
  const radius = 13;
  const vector3d = new Proton.Vector3D(1, 2, 1);
  const initializer = new Proton.RadialVelocity(radius, vector3d, 5);
  const particle = new Proton.Particle();

  it('should set the correct properties', done => {
    const {
      radiusPan: { a, b },
      dir: { x, y, z },
      tha,
      _useV,
      dirVec
    } = initializer;

    assert.equal(initializer.type, 'RadialVelocity');
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

  it('should set the particle initializer', done => {
    initializer.initialize(particle);

    const {
      velocity,
      velocity: { x, y, z }
    } = particle;

    assert.instanceOf(velocity, Proton.Vector3D);
    assert.isAbove(x, 0);
    assert.isAbove(y, 0);
    assert.isAbove(z, 0);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.RadialVelocity.fromJSON({
      radius: 1.6,
      x: 0.96,
      y: 0.88,
      z: 0.45,
      theta: 0.75
    });

    assert.instanceOf(instance, Proton.RadialVelocity);
    assert.instanceOf(instance.radiusPan, Proton.Span);
    assert.instanceOf(instance.dir, Proton.Vector3D);
    assert.equal(instance.tha, 0.013091666666666665);
    assert.deepEqual(Object.values(instance.dir), [
      0.696732280308598,
      0.6386712569495482,
      0.32659325639465536
    ]);
    assert.deepEqual([instance.radiusPan.a, instance.radiusPan.b], [1.6, 1.6]);

    done();
  });
});
