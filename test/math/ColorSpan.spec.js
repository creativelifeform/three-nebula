/*global describe, it */

import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('math -> ColorSpan', () => {
  const ColorSpan = Nebula.ColorSpan;
  const createColorSpan = Nebula.createColorSpan;

  describe('constructor', () => {
    it('should return a ColorSpan instance with random colors', () => {
      const span = new ColorSpan('random');

      assert.isTrue(span.shouldRandomize);
    });

    it('should return a ColorSpan instance with the supplied colors', () => {
      const span = new ColorSpan('#FF0000');
      const span2 = new ColorSpan(['#FF0000', '#FFF000']);

      assert.deepEqual(span.colors, ['#FF0000']);
      assert.deepEqual(span2.colors, ['#FF0000', '#FFF000']);
    });
  });

  describe('getValue', () => {
    it('should return a random color if the ColorSpan has been set to randomize', () => {
      const span = new ColorSpan('random');
      const color = span.getValue();

      assert.equal(color.length, 7);
      assert.equal(color.charAt(0), '#');
    });

    it('should return one of the supplied colors', () => {
      const colors = ['#FF0000', '#FFF000'];
      const span = new ColorSpan(colors);
      const color = span.getValue();

      assert.isTrue(colors.includes(color));
    });
  });

  describe('createColorSpan', () => {
    it('should default to a randomised ColorSpan if colors is falsey', () => {
      const span = createColorSpan(0);

      assert.isTrue(span.shouldRandomize);
    });

    it('should return the same ColorSpan instance if it is passed as an argument', () => {
      const span = new ColorSpan('random');
      const clone = createColorSpan(span);

      assert.deepEqual(span, clone);
    });

    it('should return a new ColorSpan instance', () => {
      const span = createColorSpan(['#FF0000', '#FFF000']);

      assert.instanceOf(span, ColorSpan);
    });
  });
});
