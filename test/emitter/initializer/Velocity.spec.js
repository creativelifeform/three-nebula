/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Vector Velocity', () => {
  const vector3d = new Proton.Vector3D(9, 4, 1);
  const velocity = new Proton.Velocity(vector3d, 23);
  const particle = new Proton.Particle();

  it('should set the correct properties', done => {
    const {
      radiusPan: { a, b },
      dir: { x, y, z },
      tha,
      _useV,
      dirVec
    } = velocity;

    assert.equal(a, 1);
    assert.equal(b, 1);
    assert.equal(x, 9);
    assert.equal(y, 4);
    assert.equal(z, 1);
    assert.equal(tha, 0.40147777777777777);
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
    assert.notEqual(x, 0);
    assert.notEqual(y, 0);
    assert.notEqual(z, 0);

    done();
  });
});

describe('initializer -> Polar Velocity', () => {
  const polar3d = new Proton.Polar3D(4, 9, 2);
  const velocity = new Proton.Velocity(polar3d, 9);
  const particle = new Proton.Particle();

  it('should set the correct properties', done => {
    const { tha, dirVec, _useV, radiusPan, dir } = velocity;

    assert.equal(tha, 0.1571);
    assert.instanceOf(dirVec, Proton.Vector3D);
    assert.deepEqual(Object.values(dirVec), [0, 0, 0]);
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
    assert.equal(x, 0);
    assert.equal(y, 0);
    assert.equal(z, 0);

    done();
  });
});

describe('initializer -> Radial Velocity', () => {
  const radius = 13;
  const vector3d = new Proton.Vector3D(1, 2, 1);
  const velocity = new Proton.Velocity(radius, vector3d, 5);
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
