/* global describe, it */

import { PUID } from '../../src/utils';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;

describe('utils -> PUID', () => {
  // Because PUID is a singleton and it gets used by all the test,
  // we need to create a brand new one and reset it for these tests to pass
  const NewPUID = { ...PUID };

  NewPUID._id = 0;
  NewPUID._ids = {};

  it('should create a mapping of ids to functions or objects', () => {
    const myObject = { hello: true };
    const myFunction = () => 1 + 5;
    const nid1 = NewPUID.id(myObject);

    assert.strictEqual(NewPUID._id, 1);
    assert.strictEqual(nid1, 'PUID_0');

    const nid2 = NewPUID.id(myFunction);

    assert.strictEqual(NewPUID._id, 2);
    assert.strictEqual(nid2, 'PUID_1');
    assert.isTrue(NewPUID._uids.has(myObject));
    assert.isTrue(NewPUID._uids.has(myFunction));
  });

  it('should not create a new id if the function or object has already been mapped', () => {
    const myObject = { hello: true };

    NewPUID.id(myObject);

    const spy = sinon.spy(NewPUID, 'getNewId');

    NewPUID.id(myObject);

    assert(spy.notCalled);

    spy.restore();
  });
});
