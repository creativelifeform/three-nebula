/*global describe, it */

import * as Proton from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Rate', () => {
  const rate = new Proton.Rate(
    new Proton.Span(1, 4),
    new Proton.Span(0.1, 0.5)
  );

  it('should have the correct properties after instantiation', done => {
    const { numPan, timePan, startTime, nextTime } = rate;

    assert.equal(rate.type, 'Rate');
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

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.Rate.fromJSON({
      particlesMin: 3,
      particlesMax: 10,
      perSecondMin: 0.01,
      perSecondMax: 0.05
    });

    assert.instanceOf(instance, Proton.Rate);
    assert.instanceOf(instance.numPan, Proton.Span);
    assert.instanceOf(instance.timePan, Proton.Span);
    assert.equal(instance.numPan.a, 3);
    assert.equal(instance.numPan.b, 10);
    assert.equal(instance.timePan.a, 0.01);
    assert.equal(instance.timePan.b, 0.05);

    done();
  });
});
