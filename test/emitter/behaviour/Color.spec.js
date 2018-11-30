/*global describe, it */

import * as Proton from '../../../src';

import { TIME } from '../../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Color', () => {
  const behaviour = new Proton.Color(
    0xff0000,
    'random',
    Infinity,
    Proton.ease.easeOutQuart
  );
  const particle = new Proton.Particle();

  it('should instantiate with the correct properties', done => {
    const { a, b } = behaviour;

    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isFalse(behaviour._same);
    assert.isTrue(a instanceof Proton.ArraySpan);
    assert.isTrue(b instanceof Proton.ArraySpan);
    assert.isFalse(a._isArray);
    assert.strictEqual(a.a, 1);
    assert.strictEqual(a.b, 1);
    assert.isFalse(a._center);
    assert.lengthOf(a._arr, 1);
    assert.strictEqual(a._arr[0], 16711680);
    assert.isFalse(b._isArray);
    assert.strictEqual(b.a, 1);
    assert.strictEqual(b.b, 1);
    assert.isFalse(b._center);
    assert.lengthOf(b._arr, 1);
    assert.strictEqual(b._arr[0], 'random');
    done();
  });

  it('should initialize the particle with the correct properties', done => {
    behaviour.initialize(particle);

    assert.strictEqual(particle.life, Infinity);
    assert.strictEqual(particle.age, 0);
    assert.strictEqual(particle.energy, 1);
    assert.isFalse(particle.dead);
    assert.isFalse(particle.sleep);
    assert.isNull(particle.body);
    assert.isNull(particle.parent);
    assert.strictEqual(particle.mass, 1);
    assert.strictEqual(particle.radius, 10);
    assert.strictEqual(particle.alpha, 1);
    assert.strictEqual(particle.scale, 1);
    assert.isTrue(particle.useColor);
    assert.isFalse(particle.useAlpha);
    assert.isFunction(particle.easing);
    assert.instanceOf(particle.p, Proton.Vector3D);
    assert.instanceOf(particle.v, Proton.Vector3D);
    assert.instanceOf(particle.a, Proton.Vector3D);
    assert.isObject(particle.old);
    assert.instanceOf(particle.old.p, Proton.Vector3D);
    assert.instanceOf(particle.old.v, Proton.Vector3D);
    assert.instanceOf(particle.old.a, Proton.Vector3D);
    assert.isArray(particle.behaviours);
    assert.isObject(particle.transform);
    assert.deepEqual(particle.transform.colorA, { r: 1, g: 0, b: 0 });
    assert.deepEqual(Object.keys(particle.transform.colorB), ['r', 'g', 'b']);
    Object.values(particle.transform.colorB).forEach(value =>
      assert.isNumber(value)
    );
    assert.deepEqual(particle.color, { r: 0, g: 0, b: 0 });
    assert.instanceOf(particle.rotation, Proton.Vector3D);

    done();
  });

  it('should then set the correct properties on the particle after applying behaviour', done => {
    behaviour.applyBehaviour(particle, TIME);

    assert.deepEqual(particle.transform.colorA, { r: 1, g: 0, b: 0 });
    assert.deepEqual(Object.keys(particle.transform.colorB), ['r', 'g', 'b']);
    Object.values(particle.transform.colorB).forEach(value =>
      assert.isNumber(value)
    );
    assert.deepEqual(particle.color, { r: 1, g: 0, b: 0 });

    done();
  });
});
