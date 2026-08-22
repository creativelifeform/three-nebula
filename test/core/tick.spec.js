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

const FIXED_STEP = new System().fixedTimeStep;

// A seeded system that also draws randomness every step (RandomDrift), so the
// tests exercise per-step determinism under the accumulator, not just spawn.
const buildSystem = seed => {
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

  return system;
};

const digest = system =>
  JSON.stringify(
    system.emitters.map(e =>
      e.particles.map(p => [
        p.id,
        p.position.x,
        p.position.y,
        p.position.z,
        p.velocity.x,
        p.velocity.y,
        p.velocity.z,
        p.age,
      ])
    )
  );

describe('core -> tick (fixed timestep)', () => {
  it('tick(fixedTimeStep) equals a single update()', () => {
    const stepped = buildSystem(7);
    const ticked = buildSystem(7);

    stepped.update(FIXED_STEP);
    ticked.tick(FIXED_STEP);

    assert.equal(digest(ticked), digest(stepped));
  });

  it('is frame-rate independent: the same total time chopped differently is identical', () => {
    // five small ticks vs one tick of five steps' worth of real time
    const many = buildSystem(7);
    const one = buildSystem(7);

    for (let i = 0; i < 5; i++) many.tick(FIXED_STEP);
    one.tick(FIXED_STEP * 5);

    assert.equal(digest(many), digest(one));
  });

  it('consumes floor(realDt / fixedTimeStep) steps and carries the remainder', () => {
    const ticked = buildSystem(7);
    const stepped = buildSystem(7);

    ticked.tick(FIXED_STEP * 3.4); // 3 fixed steps, 0.4 step of real time carried
    for (let i = 0; i < 3; i++) stepped.update(FIXED_STEP);

    assert.equal(digest(ticked), digest(stepped));
    assert.closeTo(ticked._accumulator, FIXED_STEP * 0.4, 1e-9);
  });

  it('clamps sub-steps and drops the backlog on a long stall (no spiral of death)', () => {
    const stalled = buildSystem(7);
    const clamped = buildSystem(7);

    stalled.tick(FIXED_STEP * 100); // a huge gap (e.g. a backgrounded tab)
    for (let i = 0; i < stalled.maxSubSteps; i++) clamped.update(FIXED_STEP);

    assert.equal(digest(stalled), digest(clamped));
    assert.equal(stalled._accumulator, 0);
  });
});
