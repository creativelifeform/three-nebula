/*global describe, it */

import * as Proton from '../../src';

import { Object3D } from 'three';
import chai from 'chai';

const { assert } = chai;
const { Pool } = Proton;

describe('core -> Pool', () => {
  it('should instantiate with the correct properties', done => {
    const { cID, list } = new Pool();

    assert.equal(cID, 0);
    assert.isObject(list);
    assert.isEmpty(list);

    done();
  });

  it('should get a new object with a unique id if the object can be instantiated', done => {
    const pool = new Pool();
    const particle = pool.get(Proton.Particle);

    assert.instanceOf(particle, Proton.Particle);
    assert.isString(particle.__puid);

    done();
  });

  it('should get a cloned object with a unique id if the object can be cloned', done => {
    const pool = new Pool();
    const object3d = new Object3D();
    const cloned = pool.get(object3d);

    assert.instanceOf(cloned, Object3D);
    assert.notEqual(object3d.id, cloned.id);
    assert.isString(cloned.__puid);

    done();
  });

  it('should return an empty array if a pooled item id does not exist', done => {
    const pool = new Pool();
    const pooled = pool._getList(Math.random());

    assert.isArray(pooled);
    assert.isEmpty(pooled);

    done();
  });

  it('should store the object in the mapped list', done => {
    const pool = new Pool();
    const particle = pool.get(Proton.Particle);

    pool.expire(particle);

    console.log(pool.list);

    done();
  });
});
