import * as THREE from 'three';
import System, {
  Alpha,
  Body,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  PointZone,
  Vector3D,
  SpriteRenderer,
  CurlNoise,
} from 'three-nebula';
import { run } from '/common/run.js';

// Curl Particles — an homage to Bobby Roe's curl-particles demo, in 3D.
//
// Particles burst from the centre and flow through a 3D curl-noise field, so those
// launched in similar directions ride the same streamline and read as a filament.
// The original fakes smooth trails with 2D canvas persistence; instead of any
// post-processing, we make each particle a VELOCITY-STRETCHED sprite — a streak
// drawn along its direction of travel, long enough to bridge the gap to the
// particle ahead of it. Consecutive streaks overlap into a continuous filament,
// with no banding and no extra particles. (This is done here manually, in a local
// renderer subclass — not yet in the library renderers.)

const UP = new Vector3D(0, 1, 0);

const PALETTE = [
  '#39e6ff',
  '#2effa0',
  '#5ce1ff',
  '#8a5cff',
  '#ff3db0',
  '#c6ff6a',
];

// A SpriteRenderer that stretches each particle along its velocity. It overrides
// only the per-particle rotate/scale hooks the MeshRenderer update loop calls:
//   - rotate: aim the sprite's local +Y at the screen-space velocity direction
//   - scale : length ∝ speed (bridges the inter-particle gap), width = base size
// Near head-on, world XY ≈ screen XY, so we can read the direction straight off
// the velocity without a full camera projection.
class VelocityStretchRenderer extends SpriteRenderer {
  constructor(container, THREE, { stretch = 0.16, width = 1.3, maxLength = 34 } = {}) {
    super(container, THREE);
    this.stretch = stretch; // world-units of length per unit speed
    this.width = width; // width multiplier on the base radius
    this.maxLength = maxLength; // cap so the fast core doesn't spike into needles
  }

  rotate(particle) {
    const { x, y } = particle.velocity;

    // local +Y is "up"; rotate it onto the velocity direction (−90° offset).
    particle.target.material.rotation = Math.atan2(y, x) - Math.PI / 2;
  }

  scale(particle) {
    const base = particle.scale * particle.radius;
    const speed = particle.velocity.length();
    const w = base * this.width;
    // Short + fat streaks that just bridge the gap overlap into a smooth tube;
    // long thin ones read as separate needles.
    const length = Math.min(w + speed * this.stretch, this.maxLength);

    particle.target.scale.set(w, Math.max(length, w), 1);
  }
}

const streak = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createFlow = () =>
  new Emitter()
    .setRate(new Rate(new Span(10, 16), new Span(0.003, 0.006))) // dense → populated streamlines
    .setInitializers([
      new Mass(1),
      new Life(3, 4.4), // live longer → reach further (reach ≈ speed × life)
      new Body(streak(0xffffff)),
      new Radius(5, 9),
      new Position(new PointZone(0, 0, 0)), // all from the centre
      new RadialVelocity(new Span(150, 280), UP, 180), // faster full-sphere burst
    ])
    .setBehaviours([
      new CurlNoise(0.016, 105, 7), // higher-frequency field → no net sideways drift
      new Color(PALETTE, PALETTE), // a hue per streak; white core from overlap
      new Alpha(1, 0),
      new Scale(1, 0.5),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(1337);

  // Head-on (slight elevation) → symmetric star, and world XY ≈ screen XY so the
  // velocity-stretch direction is accurate. Depth still reads via z-bound streaks.
  camera.position.set(0, 40, 760);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createFlow())
    .addRenderer(
      new VelocityStretchRenderer(scene, THREE, {
        stretch: 0.26,
        width: 1.2,
        maxLength: 42,
      })
    );
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
