import * as Nebula from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Vortex', () => {
  it('should instantiate with the correct properties', () => {
    const behaviour = new Nebula.Vortex();
    const {
      type,
      life,
      easing,
      age,
      energy,
      dead,
      center,
      axis,
      swirl,
      pull,
      falloff,
      isEnabled,
    } = behaviour;

    assert.equal(type, 'Vortex');
    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isTrue(center instanceof Nebula.Vector3D);
    assert.isTrue(axis instanceof Nebula.Vector3D);
    assert.deepEqual(Object.values(axis), [0, 0, 1]);
    assert.strictEqual(swirl, 400);
    assert.strictEqual(pull, 0);
    assert.strictEqual(falloff, 1);
    assert.isTrue(isEnabled);
  });

  it('should normalise the axis on construction', () => {
    const behaviour = new Nebula.Vortex(
      new Nebula.Vector3D(),
      new Nebula.Vector3D(0, 0, 2)
    );

    assert.deepEqual(Object.values(behaviour.axis), [0, 0, 1]);
  });

  it('should add a tangential swirl to the particle velocity', () => {
    // Default: center origin, axis +Z, swirl 400, pull 0, falloff 1.
    const behaviour = new Nebula.Vortex();
    const particle = new Nebula.Particle();

    particle.position.set(10, 0, 0);
    behaviour.applyBehaviour(particle, TIME);

    // tangential = axis × radial = (0,0,1) × (10,0,0) = (0,10,0)
    // scale       = swirl / dist^falloff * time = 400 / 10 * 1000 = 40000
    // velocity   += (0,10,0) * 40000 = (0, 400000, 0)
    assert.deepEqual(Object.values(particle.velocity), [0, 400000, 0]);
  });

  it('should pull inward toward the axis when pull is positive', () => {
    const behaviour = new Nebula.Vortex(
      new Nebula.Vector3D(),
      new Nebula.Vector3D(0, 0, 1),
      0, // no swirl, isolate the pull term
      400
    );
    const particle = new Nebula.Particle();

    particle.position.set(10, 0, 0);
    behaviour.applyBehaviour(particle, TIME);

    // radial term = -pull / dist * time * radial = -400/10*1000 * (10,0,0)
    //             = (-400000, 0, 0) — toward the axis
    assert.deepEqual(Object.values(particle.velocity), [-400000, 0, 0]);
  });

  it('should scale the force by 1 / dist^falloff', () => {
    const behaviour = new Nebula.Vortex(
      new Nebula.Vector3D(),
      new Nebula.Vector3D(0, 0, 1),
      400,
      0,
      2 // falloff = 2
    );
    const particle = new Nebula.Particle();

    particle.position.set(10, 0, 0);
    behaviour.applyBehaviour(particle, TIME);

    // scale = 400 / 10^2 * 1000 = 4000 → (0,10,0) * 4000 = (0, 40000, 0)
    // i.e. 10× weaker than falloff 1 at the same distance.
    assert.deepEqual(Object.values(particle.velocity), [0, 40000, 0]);
  });

  it('should leave particles on the axis untouched', () => {
    const behaviour = new Nebula.Vortex();
    const particle = new Nebula.Particle();

    // On the +Z axis: radial component is zero, no defined tangent.
    particle.position.set(0, 0, 5);
    behaviour.applyBehaviour(particle, TIME);

    assert.deepEqual(Object.values(particle.velocity), [0, 0, 0]);
  });

  it('should be deterministic — identical inputs give identical output', () => {
    const a = new Nebula.Vortex();
    const b = new Nebula.Vortex();
    const pa = new Nebula.Particle();
    const pb = new Nebula.Particle();

    pa.position.set(7, -3, 2);
    pb.position.set(7, -3, 2);

    a.applyBehaviour(pa, TIME);
    b.applyBehaviour(pb, TIME);

    assert.deepEqual(Object.values(pa.velocity), Object.values(pb.velocity));
  });

  it('should reset the behaviour properties', () => {
    const behaviour = new Nebula.Vortex();

    behaviour.reset(
      new Nebula.Vector3D(1, 2, 3),
      new Nebula.Vector3D(0, 2, 0),
      500,
      60,
      2,
      3
    );

    assert.deepEqual(Object.values(behaviour.center), [1, 2, 3]);
    assert.deepEqual(Object.values(behaviour.axis), [0, 1, 0]);
    assert.strictEqual(behaviour.swirl, 500);
    assert.strictEqual(behaviour.pull, 60);
    assert.strictEqual(behaviour.falloff, 2);
    assert.strictEqual(behaviour.life, 3);
  });

  it('should construct the behaviour from a JSON object', () => {
    const instance = Nebula.Vortex.fromJSON({
      x: 1,
      y: 2,
      z: 3,
      axisX: 0,
      axisY: 1,
      axisZ: 0,
      swirl: 500,
      pull: 60,
      falloff: 2,
      life: 3,
      easing: 'easeInOutExpo',
    });

    assert.instanceOf(instance, Nebula.Vortex);
    assert.deepEqual(Object.values(instance.center), [1, 2, 3]);
    assert.deepEqual(Object.values(instance.axis), [0, 1, 0]);
    assert.strictEqual(instance.swirl, 500);
    assert.strictEqual(instance.pull, 60);
    assert.strictEqual(instance.falloff, 2);
    assert.strictEqual(instance.life, 3);
    assert.isTrue(instance.isEnabled);
  });
});
