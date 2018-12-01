/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Rate', () => {
  const rate = new Proton.Rate(
    new Proton.Span(1, 4),
    new Proton.Span(0.1, 0.5)
  );

  it('should have the correct properties after instantiation', done => {
    const { numPan, timePan, startTime, nextTime } = rate;

    assert.strictEqual(numPan.a, 1);
    assert.strictEqual(numPan.b, 4);
    assert.strictEqual(timePan.a, 0.1);
    assert.strictEqual(timePan.b, 0.5);
    assert.strictEqual(startTime, 0);
    assert.notEqual(nextTime, 0);

    done();
  });

  it('the Rate.getValue method should return the correct value', done => {
    const rate = new Proton.Rate();
    const time = 4;

    assert.strictEqual(rate.getValue(time), 1);

    rate.numPan.b = 4;

    assert.include([1, 2, 3], rate.getValue(time));

    done();
  });
});
