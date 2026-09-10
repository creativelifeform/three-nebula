import * as Nebula from '../../src';

import chai from 'chai';

const { assert } = chai;
const { System, Emitter, Rate, Span, Life, Radius } = Nebula;

const STEP = 1 / 60;

// A parent that emits one long-lived, stationary particle, carrying a child whose
// inherit modes are set per-test. The parent particle stays put (no velocity), so
// tests can move/scale it by hand and observe how the child responds.
const build = ({
  inherit = {},
  childRadius = 10,
  childLife = 100,
  parentX = 0,
} = {}) => {
  const system = new System();

  system.setSeed(4242);

  const parent = new Emitter();

  parent
    .setRate(new Rate(new Span(1, 1), new Span(0.01, 0.01)))
    .addInitializer(new Life(100, 100));
  parent.setPosition({ x: parentX });

  const child = new Emitter();

  child
    .setRate(new Rate(new Span(1, 1), new Span(0.01, 0.01)))
    .addInitializer(new Life(childLife, childLife))
    .addInitializer(new Radius(childRadius, childRadius));
  // Start from all-none and override per test, for isolation.
  child.inherit = {
    position: 'none',
    rotation: 'none',
    scale: 'none',
    ...inherit,
  };
  child.emit(Infinity, Infinity);

  parent.addChild(child);
  system.addEmitter(parent);
  parent.emit(1);

  return { system, parent };
};

const step = (system, n = 1) => {
  for (let i = 0; i < n; i++) {
    system.update(STEP);
  }
};

// The single child instance riding the single parent particle.
const soleInstance = parent => {
  const particle = parent.particles[0];

  return { particle, instance: parent.activeChildren.get(particle)[0] };
};

describe('emitter -> Emitter -> inheritance modes', () => {
  describe('position', () => {
    it('always: the child tracks the parent every frame', () => {
      const { system, parent } = build({
        inherit: { position: 'always' },
        parentX: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      assert.closeTo(instance.position.x, 10, 1e-9, 'snapshots at spawn');

      particle.position.set(50, 60, 0);
      step(system);

      assert.closeTo(instance.position.x, 50, 1e-9, 'follows the parent');
      assert.closeTo(instance.position.y, 60, 1e-9);
    });

    it('onCreate: the child snapshots at spawn then stays put', () => {
      const { system, parent } = build({
        inherit: { position: 'onCreate' },
        parentX: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      assert.closeTo(instance.position.x, 10, 1e-9, 'snapshot taken');

      particle.position.set(50, 0, 0);
      step(system);

      assert.closeTo(instance.position.x, 10, 1e-9, 'does not follow');
    });

    it('none: the child ignores the parent (system space)', () => {
      const { system, parent } = build({
        inherit: { position: 'none' },
        parentX: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      assert.equal(instance.position.x, 0, 'stays in system space');

      particle.position.set(50, 0, 0);
      step(system);

      assert.equal(instance.position.x, 0);
    });
  });

  describe('rotation', () => {
    it('always tracks, onCreate snapshots, none ignores', () => {
      const always = build({ inherit: { rotation: 'always' } });
      const onCreate = build({ inherit: { rotation: 'onCreate' } });
      const none = build({ inherit: { rotation: 'none' } });

      [always, onCreate, none].forEach(({ system }) => step(system));

      const a = soleInstance(always.parent);
      const o = soleInstance(onCreate.parent);
      const n = soleInstance(none.parent);

      // Spin every parent particle after spawn.
      [a, o, n].forEach(({ particle }) => particle.rotation.set(1, 2, 3));
      [always, onCreate, none].forEach(({ system }) => step(system));

      assert.closeTo(a.instance.rotation.z, 3, 1e-9, 'always follows');
      assert.equal(o.instance.rotation.z, 0, 'onCreate kept its 0 snapshot');
      assert.equal(n.instance.rotation.z, 0, 'none ignores');
    });
  });

  describe('scale', () => {
    it('always: bakes the current parent scale into new child radii', () => {
      const { system, parent } = build({
        inherit: { scale: 'always' },
        childRadius: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      instance.particles.forEach(p =>
        assert.closeTo(p.radius, 10, 1e-6, 'parent scale 1 → radius unchanged')
      );

      particle.scale = 4;
      step(system, 3);

      const scaled = instance.particles.filter(p => p.radius > 30);

      assert.isAbove(scaled.length, 0, 'new child particles grew with parent');
    });

    it('onCreate: snapshots the parent scale, ignoring later changes', () => {
      const { system, parent } = build({
        inherit: { scale: 'onCreate' },
        childRadius: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      particle.scale = 4;
      step(system, 3);

      instance.particles.forEach(p =>
        assert.closeTo(p.radius, 10, 1e-6, 'radius fixed at the spawn snapshot')
      );
    });

    it('none: parent scale never touches child radius', () => {
      const { system, parent } = build({
        inherit: { scale: 'none' },
        childRadius: 10,
      });

      step(system);
      const { particle, instance } = soleInstance(parent);

      particle.scale = 9;
      step(system, 3);

      instance.particles.forEach(p => assert.closeTo(p.radius, 10, 1e-6));
    });
  });

  it('acceptance: flipping position always→onCreate turns an attached trail into a left-behind band', () => {
    // Same system, one knob. `always` keeps the child pinned to the moving
    // parent; `onCreate` leaves it where the parent was at spawn.
    const attached = build({ inherit: { position: 'always' }, parentX: 5 });
    const band = build({ inherit: { position: 'onCreate' }, parentX: 5 });

    step(attached.system);
    step(band.system);

    const a = soleInstance(attached.parent);
    const b = soleInstance(band.parent);

    a.particle.position.set(200, 0, 0);
    b.particle.position.set(200, 0, 0);
    step(attached.system);
    step(band.system);

    assert.closeTo(a.instance.position.x, 200, 1e-9, 'attached: rides along');
    assert.closeTo(b.instance.position.x, 5, 1e-9, 'band: stays behind');
  });
});
