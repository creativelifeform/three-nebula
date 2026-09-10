import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;
const { System, Emitter, Rate, Span, Life } = Nebula;

const STEP = 1 / 60;

// Builds a two-level system: a parent that bursts N particles once, each riding
// a child emitter that continuously emits its own particles. Lifetimes are set
// via Life initializers so parents/children die on a known schedule.
const build = ({
  seed = 1234,
  parentCount = 3,
  parentLife = 0.2,
  childLife = 0.1,
  orphanPolicy = 'detach',
} = {}) => {
  const system = new System();

  system.setSeed(seed);

  const parent = new Emitter();

  parent
    .setRate(new Rate(new Span(parentCount, parentCount), new Span(0.01, 0.01)))
    .addInitializer(new Life(parentLife, parentLife));

  const child = new Emitter();

  child
    .setRate(new Rate(new Span(2, 2), new Span(0.01, 0.01)))
    .addInitializer(new Life(childLife, childLife));
  child.orphanPolicy = orphanPolicy;
  child.emit(Infinity, Infinity);

  parent.addChild(child);
  system.addEmitter(parent);
  parent.emit(1);

  return { system, parent, child };
};

// Steps the system, ignoring the returned (already-resolved) promise.
const step = (system, n = 1) => {
  for (let i = 0; i < n; i++) {
    system.update(STEP);
  }
};

// Every live particle id in the system — parents, children (recursively) and
// detached instances — for determinism/lifecycle assertions.
const collectParticleIds = system => {
  const ids = [];
  const visit = emitter => {
    emitter.particles.forEach(p => ids.push(p.id));
    emitter.activeChildren.forEach(instances => instances.forEach(visit));
  };

  system.emitters.forEach(visit);
  system._detached.forEach(visit);

  return ids.sort();
};

describe('emitter -> Emitter -> hierarchy', () => {
  it('instances one child emitter per parent particle at spawn', () => {
    const { system, parent } = build({ parentCount: 4 });

    step(system);

    assert.lengthOf(parent.particles, 4, 'parent burst 4 particles');
    assert.equal(
      parent.activeChildren.size,
      4,
      'one child instance per parent'
    );
    assert.equal(system._liveEmitterInstances, 4);

    parent.activeChildren.forEach((instances, particle) => {
      assert.lengthOf(instances, 1);
      assert.strictEqual(instances[0]._parentParticle, particle);
      assert.strictEqual(instances[0].parent, system, 'parented to the System');
      assert.isTrue(instances[0].isEmitting);
    });
  });

  it("tracks the parent particle's transform (position: always)", () => {
    const { system, parent } = build({ parentCount: 1 });

    parent.setPosition({ x: 25, y: -8 });
    step(system);

    const particle = parent.particles[0];
    const [instance] = parent.activeChildren.get(particle);

    assert.closeTo(instance.position.x, particle.position.x, 1e-9);
    assert.closeTo(instance.position.y, particle.position.y, 1e-9);
    assert.isAbove(instance.particles.length, 0, 'child emitted particles');
  });

  it('stamps each particle with the id of the emitter that spawned it', () => {
    const { system, parent } = build({ parentCount: 1 });

    step(system);

    const particle = parent.particles[0];
    const [instance] = parent.activeChildren.get(particle);

    assert.equal(particle.emitterId, '0', 'top-level node id');
    assert.equal(instance.particles[0].emitterId, '0/children/0');
  });

  it('detaches child instances when their parent dies, draining then releasing', () => {
    const { system, parent } = build({
      parentCount: 2,
      parentLife: 0.1,
      childLife: 0.1,
      orphanPolicy: 'detach',
    });

    step(system); // parents + children spawn
    assert.equal(system._liveEmitterInstances, 2);

    // Age past the parents' life so they die and their children detach.
    step(system, 8);
    assert.lengthOf(parent.particles, 0, 'parents gone');
    assert.isAbove(system._detached.length, 0, 'children detached, not killed');
    system._detached.forEach(inst => assert.isFalse(inst.isEmitting));

    // Age past the detached children's particle life; they drain and release.
    step(system, 12);
    assert.lengthOf(system._detached, 0, 'detached instances drained');
    assert.equal(system._liveEmitterInstances, 0);
  });

  it('kills child instances (and their particles) with the parent under orphanPolicy: kill', () => {
    const { system, parent } = build({
      parentCount: 2,
      parentLife: 0.1,
      childLife: 10, // long — proves kill is immediate, not lifetime-driven
      orphanPolicy: 'kill',
    });

    step(system);
    assert.equal(system._liveEmitterInstances, 2);

    step(system, 8); // parents die
    assert.lengthOf(parent.particles, 0);
    assert.lengthOf(system._detached, 0, 'kill does not detach');
    assert.equal(system._liveEmitterInstances, 0, 'instances released at once');
  });

  it('recycles child instances across parent lifecycles', () => {
    const { system } = build({
      parentCount: 2,
      parentLife: 0.1,
      childLife: 0.05,
    });

    // Run long enough for a full spawn→detach→drain→release cycle.
    step(system, 25);

    assert.isAbove(system._emitterPoolHits + system._emitterPoolMisses, 0);
    assert.equal(system._liveEmitterInstances, 0, 'nothing leaked');
  });

  it('produces identical output for the same seed (determinism)', () => {
    const a = build({ seed: 777 }).system;
    const b = build({ seed: 777 }).system;

    for (let i = 0; i < 10; i++) {
      a.update(STEP);
      b.update(STEP);

      assert.deepEqual(collectParticleIds(a), collectParticleIds(b));
    }
  });

  it('rejects a hierarchy deeper than maxEmitterDepth', () => {
    const system = new System(); // default maxEmitterDepth = 4
    const root = new Emitter();

    let node = root;

    // root (0) + 5 nested children => deepest node at depth 5 > 4.
    for (let i = 0; i < 5; i++) {
      const next = new Emitter();

      node.addChild(next);
      node = next;
    }

    assert.throws(() => system.addEmitter(root), /maxDepth/);
  });
});
