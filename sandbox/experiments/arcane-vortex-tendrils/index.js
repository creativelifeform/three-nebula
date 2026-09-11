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
  RibbonRenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Arcane Vortex + ribbon tendrils. Same spell charge-up as `arcane-vortex`, now
// with glowing ribbon arms winding into the core.
//
// Combining GPU glow-points and ribbons in ONE system double-renders (the
// per-emitter renderer-routing gap). Sidestepped with TWO single-renderer
// systems sharing one scene: System A = point orb (GPURenderer), System B =
// tendrils (RibbonRenderer). A tiny facade lets the sandbox drive both.

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
    this._r.copy(particle.position).sub(this.center);
    const along = this._r.dot(this.axis);
    this._r.sub(this._axis.copy(this.axis).multiplyScalar(along));
    const dist = this._r.length() || 1e-3;
    this._t.copy(this.axis).cross(this._r).multiplyScalar(this.swirl / dist);
    this._in.copy(this._r).multiplyScalar(-this.pull / dist);
    particle.velocity
      .add(this._t.multiplyScalar(time))
      .add(this._in.multiplyScalar(time));
  }
}

const CENTER = new Vector3D(0, 0, 0);
const AXIS = new Vector3D(0, 0, 1);

// The same soft dot used for the orb sprites — shared across both systems.
const DOT = new THREE.TextureLoader().load('/assets/dot.png');

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: DOT,
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

// Same dot texture for the ribbons, stretched over each arm (uv: 'stretch'): its
// radial falloff softens the width edges and fades the arm in/out at its ends —
// a smooth streak, no beading (which is what tiling a dot gives).
const ribbonTexture = () => new THREE.TextureLoader().load('/assets/dot.png');

// ── System A: the point orb (unchanged from `arcane-vortex`) ────────────────

const createInflow = () =>
  new Emitter()
    .setRate(new Rate(new Span(8, 12), new Span(0.005, 0.01)))
    .setInitializers([
      new Mass(1),
      new Life(2.2, 3.4),
      new Body(glow(0xffffff)),
      new Radius(5, 12),
      new Position(new SphereZone(240)),
      new RadialVelocity(10, new Vector3D(0, 1, 0), 180),
    ])
    .setBehaviours([
      new Vortex(CENTER, AXIS, 820, 70),
      new Color('#8a4dff', '#33ecff'),
      new Alpha(0.9, 0),
      new Scale(1.2, 0.12),
    ])
    .emit();

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

// ── System B: ribbon tendrils ───────────────────────────────────────────────
// Each tendril emitter sits on the rim; its stream spirals into the core under
// the same Vortex field, and the RibbonRenderer connects that stream (in spawn
// order) into one continuous strip — a glowing spiral arm.

const ARMS = 6;
const RIM = 235;

const createTendril = angle =>
  new Emitter()
    .setRate(new Rate(new Span(4, 6), new Span(0.004, 0.008))) // dense → smooth spine
    .setInitializers([
      new Mass(1),
      new Life(3, 3.6), // long enough to spiral rim → core
      new Radius(2, 5),
      // NO velocity spread: every particle follows the identical deterministic
      // vortex path, so spawn order == spatial order and the ribbon spine is a
      // clean curve (a scattered spine is what makes ribbons look like flat
      // quads). Width comes from the ribbon, not particle spread.
    ])
    .setBehaviours([
      new Vortex(CENTER, AXIS, 820, 70), // same field as the orb
      // Saturated so the arms actually read as colour (a near-white birth colour
      // washes out under additive). Slower taper so the violet inner shows too.
      new Color('#12c8ff', '#a020ff'), // saturated cyan → violet inward
      new Scale(1.5, 0.4),
      new Alpha(1, 0),
    ])
    .setPosition({ x: RIM * Math.cos(angle), y: RIM * Math.sin(angle), z: 0 })
    .emit();

const init = async ({ scene, camera }) => {
  camera.position.set(0, 0, 520);
  camera.lookAt(0, 0, 0);

  // System A — point orb.
  const orb = new System();
  orb.setSeed(20260912);
  orb
    .addEmitter(createInflow())
    .addEmitter(createCore())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 20000 }));

  // System B — ribbon tendrils.
  const tendrils = new System();
  tendrils.setSeed(424242);
  for (let i = 0; i < ARMS; i++) {
    tendrils.addEmitter(createTendril((i / ARMS) * Math.PI * 2));
  }
  tendrils.addRenderer(
    new RibbonRenderer(scene, THREE, {
      camera,
      width: 16,
      texture: ribbonTexture(),
      blending: 'AdditiveBlending',
      uv: 'stretch',
    })
  );

  // Facade so the sandbox drives both systems as one.
  return {
    renderers: orb.renderers.concat(tendrils.renderers),
    get emitters() {
      return orb.emitters.concat(tendrils.emitters);
    },
    get _detached() {
      return orb._detached.concat(tendrils._detached);
    },
    tick(dt) {
      orb.tick(dt);
      tendrils.tick(dt);
    },
    update(dt) {
      orb.update(dt);
      tendrils.update(dt);
      return Promise.resolve();
    },
    destroy() {
      orb.destroy();
      tendrils.destroy();
    },
  };
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
