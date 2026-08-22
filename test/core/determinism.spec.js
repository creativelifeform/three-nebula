import * as Nebula from '../../src';
import chai from 'chai';

const { assert } = chai;
const {
  default: System,
  Emitter,
  Rate,
  Span,
  Position,
  PointZone,
  Mass,
  Radius,
  Life,
  RadialVelocity,
  Vector3D,
  Alpha,
  Scale,
  RandomDrift,
} = Nebula;

// Builds a system exercising seeded randomness across the sim path: emission
// rate, spawn-time initializers (position/radius/life/velocity) and per-step
// behaviours (RandomDrift draws every update), then steps it a fixed number of
// times. No THREE / renderer needed — this is pure simulation.
const buildAndRun = (seed, steps = 300) => {
  const system = new System();

  system.setSeed(seed);

  const emitter = new Emitter();

  emitter
    .setRate(new Rate(new Span(4, 8), new Span(0.01, 0.05)))
    .setInitializers([
      new Position(new PointZone(0, 0)),
      new Mass(1),
      new Radius(6, 12),
      new Life(2, 4),
      new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Scale(0.1, 1.3),
      new RandomDrift(10, 10, 10, 0.05),
    ]);

  system.addEmitter(emitter);
  emitter.emit();

  for (let i = 0; i < steps; i++) {
    system.update();
  }

  return system;
};

// A stable digest of the full particle buffer — the property we're protecting.
const digest = system =>
  JSON.stringify(
    system.emitters.map(emitter =>
      emitter.particles.map(p => [
        p.id,
        p.position.x,
        p.position.y,
        p.position.z,
        p.velocity.x,
        p.velocity.y,
        p.velocity.z,
        p.age,
        p.alpha,
        p.scale,
      ])
    )
  );

describe('core -> determinism', () => {
  it('actually simulates particles (sanity)', () => {
    const system = buildAndRun(1234);

    assert.isAbove(system.emitters[0].particles.length, 0);
  });

  it('same seed produces a byte-identical simulation', () => {
    assert.equal(digest(buildAndRun(1234)), digest(buildAndRun(1234)));
  });

  it('different seeds produce different simulations', () => {
    assert.notEqual(digest(buildAndRun(1234)), digest(buildAndRun(9999)));
  });

  it('deterministic particle ids replace uuid (reproducible across runs)', () => {
    const first = buildAndRun(42).emitters[0].particles[0].id;
    const second = buildAndRun(42).emitters[0].particles[0].id;

    assert.equal(first, second);
    assert.match(first, /^particle-\d+-\d+$/);
  });
});
