/*global describe, it */

import * as Proton from '../../../src';

import chai from 'chai';

const { assert } = chai;

describe('property -> Body', () => {
  const color = '#FF0000';
  const property = new Proton.Body(color, 3, 4);

  it('should have the correct properties after instantiation', done => {
    const {
      body,
      body: { _isArray, a, b, _center, _arr },
      w,
      h
    } = property;

    assert.instanceOf(body, Proton.ArraySpan);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(w, 3);
    assert.strictEqual(h, 4);
    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
    assert.lengthOf(_arr, 1);
    assert.strictEqual(_arr[0], color);

    done();
  });

  it('should set height to width if height not supplied', done => {
    const { w, h } = new Proton.Body(color, 2);

    assert.strictEqual(w, 2);
    assert.strictEqual(h, 2);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Proton.Particle();

    property.initialize(particle);

    const {
      body: { width, height, body }
    } = particle;

    assert.strictEqual(width, 3);
    assert.strictEqual(height, 4);
    assert.strictEqual(body, color);

    done();
  });
});
