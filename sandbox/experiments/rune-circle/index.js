import * as THREE from 'three';
import System, {
  Alpha,
  Behaviour,
  Body,
  Color,
  Emitter,
  Force,
  Life,
  Mass,
  Radius,
  Rate,
  Scale,
  Span,
  GPURenderer,
} from 'three-nebula';
import { run } from '/common/run.js';

// Rune Circle — a summoning glyph: an emitter orbits a ground ring (leaving a
// glowing circle of dots), while a second, synced emitter lifts energy off the
// ring. All GPU dots, one renderer; motion is sim-driven (a custom emitter
// behaviour) so it captures at 60fps.

const dot = new THREE.TextureLoader().load('/assets/dot.png');

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: dot,
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

// Orbits the emitter on a horizontal ring; velocity is radial-out + up (0 for the
// ring itself, non-zero for the rising energy). bindEmitter hands the velocity to
// each particle.
class Orbit extends Behaviour {
  constructor(orbit, radius, y, out, up) {
    super(undefined, undefined, 'Orbit', true);
    this.t = 0;
    this.orbit = orbit * 2 * Math.PI;
    this.radius = radius;
    this.y = y;
    this.out = out;
    this.up = up;
  }

  mutate(emitter, time) {
    this.t += time;
    const a = this.t * this.orbit;
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    emitter.position.set(this.radius * ca, this.y, this.radius * sa);
    emitter.velocity.set(this.out * ca, this.up, this.out * sa);
  }
}

const R = 120;

// The ring: dots that stay put (velocity 0), long enough to fill the whole
// circle → a continuous glowing glyph with a bright leading edge.
const createRing = () => {
  const ring = new Emitter();

  ring
    .setRate(new Rate(new Span(2, 3), new Span(0.006, 0.01)))
    .setInitializers([
      new Mass(1),
      new Life(1.5, 1.9), // long enough to fill the whole circle
      new Body(glow(0xffffff)),
      new Radius(14, 22), // big, overlapping → a continuous glowing ring
    ])
    .setBehaviours([
      new Color('#ffe08a', '#ff6a1a'), // gold → amber
      new Alpha(0.5, 0), // leave tonal range for bloom to lift
      new Scale(1, 0.9),
    ]);
  ring.addEmitterBehaviour(new Orbit(0.9, R, 0, 0, 0)); // slower → denser ring

  return ring.emit();
};

// Rising energy: same orbit, but lifting up + drifting out, then arcing back.
const createRisers = () => {
  const risers = new Emitter();

  risers
    .setRate(new Rate(new Span(7, 10), new Span(0.004, 0.008))) // dense, but not a hot pile-up at the head
    .setInitializers([
      new Mass(1),
      new Life(0.9, 1.5),
      new Body(glow(0xffffff)),
      new Radius(10, 16),
    ])
    .setBehaviours([
      new Color('#cdefff', '#3a6cff'), // pale cyan → blue
      new Alpha(0.45, 0), // leave tonal range for bloom to lift
      new Scale(1.2, 0.45),
      new Force(0, -0.25, 0),
    ]);
  risers.addEmitterBehaviour(new Orbit(0.9, R, 0, 16, 90));

  return risers.emit();
};

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(90909);
  camera.position.set(0, 140, 250);
  camera.lookAt(0, 12, 0);

  return system
    .addEmitter(createRing())
    .addEmitter(createRisers())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 24000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
