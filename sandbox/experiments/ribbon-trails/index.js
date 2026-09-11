import * as THREE from 'three';
import System, {
  Alpha,
  Color,
  Emitter,
  Life,
  Mass,
  Rate,
  Scale,
  Span,
  RibbonRenderer,
} from 'three-nebula';
import { run } from '/common/run.js';

// Ribbon renderer (spec 01, Stage 4). Each emitter lays a dense, stationary
// stream of short-lived particles as it flies along a path; the RibbonRenderer
// connects each emitter's particles (its spine, in spawn order) into one
// continuous, camera-facing strip. Several emitters → several ribbons, keyed by
// emitterInstanceId — the per-instance grouping the hierarchy relies on.

const PALETTE = [
  ['#00ffa3', '#0066ff'],
  ['#ff4d6d', '#ffd166'],
  ['#8a5cff', '#00e5ff'],
];

// A ribbon emitter emits a fast, dense stream of near-stationary particles (so
// they stay on the path) that fade and taper (Scale → 0) toward the tail.
const createRibbonEmitter = ([colorA, colorB]) => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(2, 3), new Span(0.006, 0.012)))
    .setInitializers([new Mass(1), new Life(0.9, 1.3)])
    .setBehaviours([
      new Color(colorA, colorB),
      new Scale(1, 0),
      new Alpha(1, 0),
    ])
    .emit();
};

// Fly each emitter along a phase-shifted Lissajous path; particles are left
// behind on the path, so the ribbon traces where the emitter has been.
const fly = (emitters, t = 0) => {
  t += 0.016;

  emitters.forEach((emitter, i) => {
    const phase = (i / emitters.length) * Math.PI * 2;
    const r = 120;

    emitter.position.x = r * Math.cos(t * 1.1 + phase);
    emitter.position.y = r * 0.6 * Math.sin(t * 1.7 + phase);
    emitter.position.z = r * 0.45 * Math.sin(t * 0.9 + phase);
  });

  requestAnimationFrame(() => fly(emitters, t));
};

const init = async ({ scene, camera }) => {
  const system = new System();
  const emitters = PALETTE.map(createRibbonEmitter);
  const renderer = new RibbonRenderer(scene, THREE, {
    camera,
    width: 16,
    blending: 'AdditiveBlending',
    uv: 'stretch',
  });

  // Pull back so the whole ±120 path is framed.
  camera.position.set(0, 0, 440);
  camera.lookAt(0, 0, 0);

  emitters.forEach(emitter => system.addEmitter(emitter));
  system.addRenderer(renderer);
  fly(emitters);

  return system;
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
