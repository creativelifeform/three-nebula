import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;
const { System, Emitter, Rate, Span, Life } = Nebula;

const STEP = 1 / 60;

// A parent that emits one short-lived particle, carrying a `death`-trigger burst
// child that fires once at the parent's death position.
const build = ({
  seed = 1,
  parentX = 0,
  parentLife = 0.1,
  burstCount = 5,
  childLife = 0.1,
  withSmoke = false,
} = {}) => {
  const system = new System();

  system.setSeed(seed);

  const parent = new Emitter();

  parent
    .setRate(new Rate(new Span(1, 1), new Span(0.01, 0.01)))
    .addInitializer(new Life(parentLife, parentLife));
  parent.setPosition({ x: parentX });

  const burst = new Emitter();

  burst
    .setRate(new Rate(new Span(burstCount, burstCount), new Span(0.01, 0.01)))
    .addInitializer(new Life(childLife, childLife));
  burst.trigger = 'death';
  burst.emit(1); // one-shot burst

  parent.addChild(burst);

  if (withSmoke) {
    const smoke = new Emitter();

    smoke
      .setRate(new Rate(new Span(1, 1), new Span(0.01, 0.01)))
      .addInitializer(new Life(childLife, childLife));
    // default trigger 'spawn' — attaches at birth
    smoke.emit(Infinity, Infinity);
    parent.addChild(smoke);
  }

  system.addEmitter(parent);
  parent.emit(1);

  return { system, parent };
};

const step = (system, n = 1) => {
  for (let i = 0; i < n; i++) {
    system.update(STEP);
  }
};

const collectBurstParticleIds = system => {
  const ids = [];

  system._detached.forEach(inst => inst.particles.forEach(p => ids.push(p.id)));

  return ids.sort();
};

describe('emitter -> Emitter -> events (death trigger)', () => {
  it('does not instance a death-trigger child at parent birth', () => {
    const { system, parent } = build();

    step(system);

    assert.isAbove(parent.particles.length, 0, 'parent alive');
    assert.equal(parent.activeChildren.size, 0, 'nothing attached at birth');
    assert.equal(system._liveEmitterInstances, 0);
    assert.lengthOf(system._detached, 0);
  });

  it('bursts the child at the parent death position, outliving the parent', () => {
    const { system, parent } = build({ parentX: 30, burstCount: 6 });

    step(system, 10); // age the parent past its life

    assert.lengthOf(parent.particles, 0, 'parent gone');
    assert.lengthOf(system._detached, 1, 'one burst instance');

    const burst = system._detached[0];

    assert.equal(burst.particles.length, 6, 'burst emitted its particles');
    assert.closeTo(burst.position.x, 30, 1e-9, 'positioned at death spot');
    burst.particles.forEach(p =>
      assert.closeTo(p.position.x, 30, 1e-6, 'burst particles at death spot')
    );
  });

  it('drains and releases the burst — no leak', () => {
    const { system } = build({ parentLife: 0.1, childLife: 0.1 });

    step(system, 30);

    assert.lengthOf(system._detached, 0, 'burst drained');
    assert.equal(system._liveEmitterInstances, 0, 'instance released');
  });

  it('coexists with a spawn-trigger child: one attaches, the other bursts', () => {
    const { system, parent } = build({ withSmoke: true });

    step(system);
    // Only the spawn child (smoke) attaches at birth.
    assert.equal(parent.activeChildren.size, 1);
    assert.equal(system._liveEmitterInstances, 1);

    step(system, 10); // parent dies → smoke detaches, burst fires
    // Two detached instances now: the drained-detaching smoke and the burst.
    assert.isAtLeast(system._detached.length, 1);
    const totalBurstParticles = system._detached.reduce(
      (n, inst) => n + inst.particles.length,
      0
    );
    assert.isAbove(totalBurstParticles, 0, 'burst produced particles');
  });

  it('is deterministic for a given seed', () => {
    const a = build({ seed: 99 }).system;
    const b = build({ seed: 99 }).system;

    for (let i = 0; i < 12; i++) {
      a.update(STEP);
      b.update(STEP);
    }

    assert.deepEqual(collectBurstParticleIds(a), collectBurstParticleIds(b));
  });
});
