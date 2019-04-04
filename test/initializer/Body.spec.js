/*global describe, it */

import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;

describe('initializer -> Body', () => {
  const color = '#FF0000';
  const initializer = new Nebula.Body(color, 3, 4);

  it('should have the correct properties after instantiation', done => {
    const {
      body,
      body: { _isArray, a, b, _center, items },
      w,
      h,
    } = initializer;

    assert.equal(initializer.type, 'Body');
    assert.instanceOf(body, Nebula.ArraySpan);
    assert.isFalse(_isArray);
    assert.isFalse(_center);
    assert.strictEqual(w, 3);
    assert.strictEqual(h, 4);
    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
    assert.lengthOf(items, 1);
    assert.strictEqual(items[0], color);

    done();
  });

  it('should set height to width if height not supplied', done => {
    const { w, h } = new Nebula.Body(color, 2);

    assert.strictEqual(w, 2);
    assert.strictEqual(h, 2);

    done();
  });

  it('should set the correct properties on the particle after initialization', done => {
    const particle = new Nebula.Particle();

    initializer.initialize(particle);

    const {
      body: { width, height, body },
    } = particle;

    assert.strictEqual(width, 3);
    assert.strictEqual(height, 4);
    assert.strictEqual(body, color);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Nebula.Body.fromJSON({
      body: '#FF0000',
      width: 4,
      height: 5,
    });

    assert.instanceOf(instance, Nebula.Body);
    assert.instanceOf(instance.body, Nebula.ArraySpan);
    assert.equal(instance.w, 4);
    assert.equal(instance.h, 5);
    assert.isTrue(instance.isEnabled);

    done();
  });
});
