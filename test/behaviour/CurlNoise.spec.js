import * as Nebula from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> CurlNoise', () => {
  it('should instantiate with the correct properties', () => {
    const behaviour = new Nebula.CurlNoise();
    const { type, life, easing, age, energy, dead, scale, strength, seed } =
      behaviour;

    assert.equal(type, 'CurlNoise');
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.strictEqual(scale, 0.01);
    assert.strictEqual(strength, 100);
    assert.strictEqual(seed, 1);
  });

  it('should impart a velocity from the flow field', () => {
    const behaviour = new Nebula.CurlNoise(0.01, 100, 1337);
    const particle = new Nebula.Particle();

    particle.position.set(120, -40, 25);
    behaviour.applyBehaviour(particle, TIME);

    // The curl of noise is non-zero at a generic point → velocity changes.
    assert.notDeepEqual(Object.values(particle.velocity), [0, 0, 0]);
  });

  it('should be deterministic — same seed and input give the same output', () => {
    const a = new Nebula.CurlNoise(0.01, 100, 1337);
    const b = new Nebula.CurlNoise(0.01, 100, 1337);
    const pa = new Nebula.Particle();
    const pb = new Nebula.Particle();

    pa.position.set(120, -40, 25);
    pb.position.set(120, -40, 25);

    a.applyBehaviour(pa, TIME);
    b.applyBehaviour(pb, TIME);

    assert.deepEqual(Object.values(pa.velocity), Object.values(pb.velocity));
  });

  it('should produce a different field for a different seed', () => {
    const a = new Nebula.CurlNoise(0.01, 100, 1337);
    const b = new Nebula.CurlNoise(0.01, 100, 9001);
    const pa = new Nebula.Particle();
    const pb = new Nebula.Particle();

    pa.position.set(120, -40, 25);
    pb.position.set(120, -40, 25);

    a.applyBehaviour(pa, TIME);
    b.applyBehaviour(pb, TIME);

    assert.notDeepEqual(Object.values(pa.velocity), Object.values(pb.velocity));
  });

  it('should scale the imparted velocity by strength', () => {
    const weak = new Nebula.CurlNoise(0.01, 100, 1337);
    const strong = new Nebula.CurlNoise(0.01, 200, 1337);
    const pw = new Nebula.Particle();
    const ps = new Nebula.Particle();

    pw.position.set(120, -40, 25);
    ps.position.set(120, -40, 25);

    weak.applyBehaviour(pw, TIME);
    strong.applyBehaviour(ps, TIME);

    // Same field, double strength → double the velocity delta.
    assert.closeTo(ps.velocity.x, pw.velocity.x * 2, 1e-9);
    assert.closeTo(ps.velocity.y, pw.velocity.y * 2, 1e-9);
    assert.closeTo(ps.velocity.z, pw.velocity.z * 2, 1e-9);
  });

  it('should reset the behaviour properties', () => {
    const behaviour = new Nebula.CurlNoise();

    behaviour.reset(0.02, 250, 77, 3);

    assert.strictEqual(behaviour.scale, 0.02);
    assert.strictEqual(behaviour.strength, 250);
    assert.strictEqual(behaviour.seed, 77);
    assert.strictEqual(behaviour.life, 3);
  });

  it('should construct the behaviour from a JSON object', () => {
    const instance = Nebula.CurlNoise.fromJSON({
      scale: 0.02,
      strength: 250,
      seed: 77,
      life: 3,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Nebula.CurlNoise);
    assert.strictEqual(instance.scale, 0.02);
    assert.strictEqual(instance.strength, 250);
    assert.strictEqual(instance.seed, 77);
    assert.strictEqual(instance.life, 3);
    assert.isTrue(instance.isEnabled);
  });
});
