import * as THREE from 'three';
import System, {
  Alpha,
  Behaviour,
  Color,
  Emitter,
  Life,
  Mass,
  Radius,
  Rate,
  Scale,
  Span,
  RibbonRenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Blade Arc — a sword slash. An emitter whips along an arc (a fast sweep, then a
// rest), leaving a camera-facing crescent ribbon that fades before the next
// swing. Sim-driven (a custom emitter behaviour) so it captures at 60fps; during
// the rest the emitter is stationary, so its coincident points dedup away and the
// crescent simply fades out.

class SwingArc extends Behaviour {
  // period: full cycle s; swing: fraction spent sweeping; radius/centre define
  // the arc; from/to are the sweep angles (radians).
  constructor(period, swing, radius, cx, cy, from, to) {
    super(undefined, undefined, 'SwingArc', true);
    this.t = 0;
    this.period = period;
    this.swing = swing;
    this.radius = radius;
    this.cx = cx;
    this.cy = cy;
    this.from = from;
    this.to = to;
  }

  mutate(emitter, time) {
    this.t += time;
    const phase = (this.t % this.period) / this.period;
    // Ease the sweep (fast in the middle) during the swing; hold at the end
    // otherwise so the crescent left behind fades.
    let s = phase < this.swing ? phase / this.swing : 1;
    s = s * s * (3 - 2 * s); // smoothstep
    const ang = this.from + (this.to - this.from) * s;

    emitter.position.set(
      this.cx + this.radius * Math.cos(ang),
      this.cy + this.radius * Math.sin(ang),
      0
    );
  }
}

const D = Math.PI / 180;

const createBlade = () => {
  const blade = new Emitter();

  blade
    // One point per frame (steady spine); the sweep spaces them along the arc.
    .setRate(new Rate(new Span(1, 1), new Span(0.008, 0.012)))
    .setInitializers([new Mass(1), new Life(0.45, 0.6), new Radius(2, 4)])
    .setBehaviours([
      new Color('#ffffff', '#39d8ff'), // white-hot edge → cyan trail
      new Scale(1.5, 0), // full at the leading edge, tapering to nothing
      new Alpha(1, 0),
    ]);

  // Diagonal slash: tip sweeps upper-left → lower-right over ~0.45s, then rests.
  blade.addEmitterBehaviour(
    new SwingArc(1.15, 0.4, 150, 0, 0, 145 * D, -35 * D)
  );

  return blade.emit();
};

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(160934);
  camera.position.set(0, 0, 420);
  camera.lookAt(0, 0, 0);

  return system.addEmitter(createBlade()).addRenderer(
    new RibbonRenderer(scene, THREE, {
      camera, // camera-facing: the crescent faces the viewer
      width: 34,
      blending: 'AdditiveBlending',
      uv: 'stretch',
    })
  );
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
