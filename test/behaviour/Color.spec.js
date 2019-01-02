/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import { getEasingByName } from '../../src/ease';

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
    const { colorA, colorB } = behaviour;

    assert.equal(behaviour.type, 'Color');
    assert.strictEqual(behaviour.life, Infinity);
    assert.isFunction(behaviour.easing);
    assert.strictEqual(behaviour.age, 0);
    assert.strictEqual(behaviour.energy, 1);
    assert.isFalse(behaviour.dead);
    assert.isFalse(behaviour._same);
    assert.isTrue(colorA instanceof Proton.ColorSpan);
    assert.isTrue(colorB instanceof Proton.ColorSpan);
    assert.isFalse(colorA._isArray);
    assert.strictEqual(colorA.a, 1);
    assert.strictEqual(colorA.b, 1);
    assert.isFalse(colorA._center);
    assert.lengthOf(colorA.colors, 1);
    assert.strictEqual(colorA.colors[0], 16711680);
    assert.isFalse(colorB._isArray);
    assert.strictEqual(colorB.a, 1);
    assert.strictEqual(colorB.b, 1);
    assert.isFalse(colorB._center);
    assert.lengthOf(colorB.colors, 1);
    assert.strictEqual(colorB.colors[0], 'random');

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

  it('should construct the behaviour from a JSON object', done => {
    const instance = Proton.Color.fromJSON({
      colorA: '#FF0000',
      colorB: '#000000',
      life: 3,
      easing: 'easeInOutExpo'
    });

    assert.instanceOf(instance, Proton.Color);
    assert.instanceOf(instance.colorA, Proton.ColorSpan);
    assert.instanceOf(instance.colorB, Proton.ColorSpan);
    assert.equal(instance.life, 3);
    assert.deepEqual(instance.easing, getEasingByName('easeInOutExpo'));

    done();
  });
});
