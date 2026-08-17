import * as Nebula from '../../src';

import chai from 'chai';
import { mulberry32 } from '../../src/math/rng';

const { assert } = chai;

describe('math -> Span', () => {
  const { Span, ArraySpan } = Nebula;

  describe('sample', () => {
    it('is equivalent to getValue(false, rng) for the same stream', () => {
      const span = new Span(0, 30);

      // Two independent streams from the same seed must agree call-for-call.
      const a = span.sample(mulberry32(123));
      const b = span.getValue(false, mulberry32(123));

      assert.equal(a, b);
    });

    it('draws deterministically from a seeded stream', () => {
      const span = new Span(0, 30);
      const seq = rng => [span.sample(rng), span.sample(rng), span.sample(rng)];

      assert.deepEqual(seq(mulberry32(7)), seq(mulberry32(7)));
    });

    it('falls back to Math.random when no stream is given', () => {
      const span = new Span(5, 5); // zero-width range → always 5

      assert.equal(span.sample(), 5);
    });

    it('is inherited by ArraySpan and returns a member element', () => {
      const items = ['a', 'b', 'c'];
      const span = new ArraySpan(items);

      assert.isTrue(items.includes(span.sample(mulberry32(1))));
    });
  });
});
