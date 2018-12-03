/*global describe, it */

import * as Proton from '../../src';

import chai from 'chai';
import sinon from 'sinon';

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

  it('should create a new object if the object is a function', done => {
    done();
  });
});
