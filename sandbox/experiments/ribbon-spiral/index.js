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

// Ribbon Spiral — a smooth conical glow (matching the reference). A single
// emitter spins a tight top ring and flings its particles outward + downward, so
// each ring expands and sinks as it ages → a dome of nested rings, drawn as ONE
// continuous ribbon per RibbonRenderer.
//
// Smoothness rule (the ribbon's spine is one point per sim frame): emit exactly
// one particle per frame (no clusters → no bright ribs), and keep the spin slow
// enough that a ring gets plenty of points (≈ 60 / orbitHz points per turn).

class DomeSpin extends Behaviour {
  constructor(orbit, radius, top, out, down) {
    super(undefined, undefined, 'DomeSpin', true);
    this.t = 0;
    this.orbit = orbit * 2 * Math.PI;
    this.radius = radius;
    this.top = top;
    this.out = out;
    this.down = down;
  }

  mutate(emitter, time) {
    this.t += time;
    const a = this.t * this.orbit;
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    emitter.position.set(this.radius * ca, this.top, this.radius * sa);
    emitter.velocity.set(this.out * ca, -this.down, this.out * sa);
  }
}

const createSpiral = () => {
  const emitter = new Emitter();

  emitter
    // Exactly one particle per frame (interval < a frame; count 1): an evenly
    // spaced spine, not per-frame clusters that show up as bright ribs.
    .setRate(new Rate(new Span(1, 1), new Span(0.008, 0.012)))
    .setInitializers([new Mass(1), new Life(4.6, 5.4), new Radius(2, 4)])
    .setBehaviours([
      new Color('#c77bff', '#5a18b0'), // bright violet (new) → deep purple (old)
      new Scale(1.1, 0.8),
      new Alpha(1, 0), // older, wider rings fade out below
    ]);

  // Slow spin (0.7/s ⇒ ~85 points per ring at 60fps) with a gentle expansion so
  // the long-lived ribbon stacks several nested rings into a dome.
  emitter.addEmitterBehaviour(new DomeSpin(0.7, 32, 100, 46, 38));

  return emitter.emit();
};

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(2718281);
  camera.position.set(0, 120, 300);
  camera.lookAt(0, 0, 0);

  return system.addEmitter(createSpiral()).addRenderer(
    // No camera: axis-aligned (world-up) lays the strip flat in horizontal
    // planes — right for a dome of rings, and it avoids the edge-on flares a
    // camera-facing strip gets.
    new RibbonRenderer(scene, THREE, {
      width: 24,
      blending: 'AdditiveBlending',
      uv: 'stretch',
      smoothing: 4,
    })
  );
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
