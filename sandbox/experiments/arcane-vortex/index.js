import * as THREE from 'three';
import System, {
  Alpha,
  Behaviour,
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
  SphereZone,
  GPURenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Arcane Vortex — a spell charge-up: energy is drawn inward in a tightening
// spiral toward the caster's focus, brightening as it converges.
//
// Ad-hoc workaround for a real library gap (no curl/vortex force field, filed as
// specs/curl-noise-force-field.md): a custom Behaviour applying a tangential
// force around an axis plus an inward pull. Written against particle.velocity, so
// it is NOT subject to the Force ×100 (MEASURE) scaling — tune in the hundreds.

class Vortex extends Behaviour {
  constructor(center, axis, swirl = 400, pull = 80, life, easing, isEnabled = true) {
    super(life, easing, 'Vortex', isEnabled);
    this.center = center;
    this.axis = axis.clone().normalize();
    this.swirl = swirl;
    this.pull = pull;
    this._r = new Vector3D();
    this._t = new Vector3D();
    this._in = new Vector3D();
    this._axis = new Vector3D();
  }

  mutate(particle, time) {
    this.energize(particle, time);

    // Radial vector from the axis line to the particle (component ⟂ to axis).
    this._r.copy(particle.position).sub(this.center);
    const along = this._r.dot(this.axis);
    this._r.sub(this._axis.copy(this.axis).multiplyScalar(along));

    const dist = this._r.length() || 1e-3;

    // Tangential swirl (axis × radial) + inward pull, tightened toward the core.
    this._t.copy(this.axis).cross(this._r).multiplyScalar(this.swirl / dist);
    this._in.copy(this._r).multiplyScalar(-this.pull / dist);

    particle.velocity
      .add(this._t.multiplyScalar(time))
      .add(this._in.multiplyScalar(time));
  }
}

const CENTER = new Vector3D(0, 0, 0);
const AXIS = new Vector3D(0, 0, 1); // swirl faces the camera

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'), // soft solid, not a ring
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

// Inflowing energy — spawns across a sphere, spirals in, brightens, dissipates.
const createInflow = () =>
  new Emitter()
    .setRate(new Rate(new Span(10, 16), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(2.2, 3.4), // long enough to make several visible revolutions
      new Body(glow(0xffffff)),
      new Radius(5, 12),
      new Position(new SphereZone(240)),
      new RadialVelocity(10, new Vector3D(0, 1, 0), 180), // faint seed motion
    ])
    .setBehaviours([
      // Strong swirl, gentler pull → particles orbit several times as they fall
      // in, so the spiral reads (not just a churning cloud).
      new Vortex(CENTER, AXIS, 820, 70),
      new Color('#8a4dff', '#33ecff'), // violet → arcane cyan as it converges
      new Alpha(0.9, 0),
      new Scale(1.2, 0.12),
    ])
    .emit();

// The core — a bright, pulsing focus where the energy converges.
const createCore = () =>
  new Emitter()
    .setRate(new Rate(new Span(2, 4), new Span(0.01, 0.03)))
    .setInitializers([
      new Mass(1),
      new Life(0.5, 0.9),
      new Body(glow(0xffffff)),
      new Radius(18, 34),
      new Position(new SphereZone(18)),
    ])
    .setBehaviours([
      new Color('#ffffff', '#66e0ff'),
      new Alpha(1, 0),
      new Scale(0.6, 1.8),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(20260912); // deterministic swirl

  camera.position.set(0, 0, 520);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createInflow())
    .addEmitter(createCore())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 20000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
