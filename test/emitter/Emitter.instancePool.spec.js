import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;
const { Emitter, System, Rate, Span } = Nebula;

// A minimal stand-in for a parent particle — acquireInstance only reads `.id`.
const parent = id => ({ id });

// Builds a child-emitter *template*: a normal emitter with a tree-path nodeId,
// exactly as the hierarchy loader (Stage 2) will produce.
const makeNode = (nodeId = '0/children/0') => {
  const node = new Emitter();

  node.nodeId = nodeId;
  node.setRate(new Rate(new Span(1, 1), new Span(0.1, 0.1)));

  return node;
};

describe('emitter -> Emitter -> instance pool', () => {
  it('acquires a cold instance that shares config but owns its runtime state', () => {
    const node = makeNode();
    const inst = node.acquireInstance(parent('particle-1-0'));

    // Shared-by-reference config (read-only during simulation).
    assert.strictEqual(inst.initializers, node.initializers);
    assert.strictEqual(inst.behaviours, node.behaviours);
    assert.strictEqual(inst.emitterBehaviours, node.emitterBehaviours);
    assert.strictEqual(inst.childNodes, node.childNodes);

    // Per-instance mutable state.
    assert.notStrictEqual(inst.rate, node.rate, 'instance gets its own Rate');
    assert.strictEqual(inst.rate.numPan, node.rate.numPan, 'sharing the Spans');
    assert.notStrictEqual(inst.particles, node.particles);
    assert.strictEqual(inst._template, node);
    assert.strictEqual(inst.nodeId, node.nodeId);
    assert.isTrue(inst.isEmitting);
  });

  it('recycles a released instance on the next acquire (no new allocation)', () => {
    const node = makeNode();
    const a = node.acquireInstance(parent('particle-1-0'));

    node.releaseInstance(a);
    assert.isFalse(a.isEmitting);
    assert.lengthOf(node._freeInstances, 1);

    const b = node.acquireInstance(parent('particle-1-1'));

    assert.strictEqual(b, a, 'the freed instance is reused');
    assert.lengthOf(node._freeInstances, 0);
  });

  it('keeps the instance pool bounded by live instances under heavy churn', () => {
    // Mirror the renderer lifecycle: every parent particle spawns a fresh child
    // instance, but at most `live` are alive at once. The free-list must bound
    // the total object count to the live high-water mark, not cumulative spawns.
    const node = makeNode();
    const live = 8;
    const totalSpawns = 5000;
    const alive = [];

    for (let i = 0; i < totalSpawns; i++) {
      alive.push(node.acquireInstance(parent(`particle-1-${i}`)));

      if (alive.length > live) {
        node.releaseInstance(alive.shift());
      }
    }

    // Objects ever created = the live high-water mark, everything else recycled.
    const created = node._freeInstances.length + alive.length;

    assert.isAtMost(created, live + 1, 'no growth with cumulative spawns');
  });

  it('resets runtime state so a recycled instance is indistinguishable from cold', () => {
    const node = makeNode();
    const a = node.acquireInstance(parent('particle-1-0'));

    a.age = 5;
    a.dead = true;
    a.particles.push({});
    a.position.set(3, 4, 5);
    node.releaseInstance(a);

    const b = node.acquireInstance(parent('particle-1-1'));

    assert.strictEqual(b, a);
    assert.equal(b.age, 0);
    assert.isFalse(b.dead);
    assert.lengthOf(b.particles, 0);
    assert.equal(b.position.x, 0);
    assert.equal(b._parentParticle.id, 'particle-1-1');
  });

  it('derives a deterministic seed from node id + parent particle id', () => {
    const node = makeNode();
    const a = node.acquireInstance(parent('particle-1-42'));
    const seedA = a.seed;

    node.releaseInstance(a);

    // Same node + same parent id → identical seed, regardless of pooling.
    const b = node.acquireInstance(parent('particle-1-42'));
    assert.equal(b.seed, seedA);

    // Different parent id → different stream.
    node.releaseInstance(b);
    const c = node.acquireInstance(parent('particle-1-43'));
    assert.notEqual(c.seed, seedA);
  });
});

describe('core -> System -> emitter instance cap', () => {
  it('spawns instances, tracking pool hits/misses and the live count', () => {
    const system = new System();
    const node = makeNode();

    const a = system.spawnEmitterInstance(node, parent('particle-1-0'));

    assert.instanceOf(a, Emitter);
    assert.equal(system._liveEmitterInstances, 1);
    assert.equal(system._emitterPoolMisses, 1, 'cold acquire is a miss');
    assert.equal(system._emitterPoolHits, 0);

    system.releaseEmitterInstance(a);
    assert.equal(system._liveEmitterInstances, 0);

    system.spawnEmitterInstance(node, parent('particle-1-1'));
    assert.equal(system._emitterPoolHits, 1, 'recycled acquire is a hit');
  });

  it('drops the newest instance and warns once past maxEmitterInstances', () => {
    const system = new System();
    const node = makeNode();

    system.maxEmitterInstances = 2;

    assert.instanceOf(
      system.spawnEmitterInstance(node, parent('p-0')),
      Emitter
    );
    assert.instanceOf(
      system.spawnEmitterInstance(node, parent('p-1')),
      Emitter
    );

    // Third exceeds the cap → dropped.
    assert.isNull(system.spawnEmitterInstance(node, parent('p-2')));
    assert.equal(system._liveEmitterInstances, 2);
    assert.isTrue(system._warnedInstanceOverflow);
  });
});
