/* global describe, it */

import { PUID } from '../../src/utils';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;

describe('utils -> PUID', () => {
  it('should create a mapping of ids to functions or objects', () => {
    const myObject = { hello: true };
    const myFunction = () => 1 + 5;
    const nid1 = PUID.id(myObject);

    assert.strictEqual(PUID._id, 1);
    assert.strictEqual(nid1, 'PUID_0');

    const nid2 = PUID.id(myFunction);

    assert.strictEqual(PUID._id, 2);
    assert.strictEqual(nid2, 'PUID_1');
    assert.strictEqual(PUID._uids[nid1], myObject);
    assert.strictEqual(PUID._uids[nid2], myFunction);
  });

  it('should not create a new id if the function or object has already been mapped', () => {
    const myObject = { hello: true };

    PUID.id(myObject);

    const spy = sinon.spy(PUID, 'getNewId');

    PUID.id(myObject);

    assert(spy.notCalled);

    spy.restore();
  });
});
