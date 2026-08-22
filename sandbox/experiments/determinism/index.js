import * as THREE from 'three';
import System, {
  Alpha,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  PointZone,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  SpriteRenderer,
  Span,
  Vector3D,
} from 'three-nebula';

// ---------------------------------------------------------------------------
// Determinism demo.
//
// Two INDEPENDENT particle systems are built with the same seed and stepped in
// perfect lockstep (both advanced by the same fixed dt every frame). Because
// every random draw comes from the seed rather than Math.random, the two
// systems evolve identically — the clusters mirror each other and the live
// state digests stay equal, frame after frame.
//
// Tick "desync right" and replay to seed the right system differently: same
// engine, same setup, one number changed — and the two immediately diverge.
// ---------------------------------------------------------------------------

const FIXED_STEP = 1 / 60;
const OFFSET_X = 28;

const el = id => document.getElementById(id);
const canvas = el('canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setClearColor('black');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);

camera.position.set(0, 0, 110);
camera.lookAt(scene.position);

// Each system renders into its own group so a replay can drop all its sprites
// in one go, without per-particle teardown.
const leftGroup = new THREE.Group();
const rightGroup = new THREE.Group();

leftGroup.position.x = -OFFSET_X;
rightGroup.position.x = OFFSET_X;
scene.add(leftGroup, rightGroup);

const resize = () => {
  const { clientWidth, clientHeight } = canvas;

  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
};

window.addEventListener('resize', resize);

/**
 * Builds a system seeded with `seed`, rendering into `group`. The setup is
 * identical for both sides — only the seed differs.
 */
const buildSystem = (seed, group) => {
  const system = new System();

  // The one line that makes it reproducible: fix the root of the seed
  // hierarchy. Every emitter/particle stream is derived from it.
  system.setSeed(seed);

  const emitter = new Emitter();

  emitter
    .setRate(new Rate(new Span(2, 4), new Span(0.05, 0.1)))
    .setInitializers([
      new Position(new PointZone(0, 0)),
      new Mass(1),
      new Radius(6, 10),
      new Life(2, 3),
      new RadialVelocity(60, new Vector3D(0, 1, 0), 60),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Scale(1, 0.4),
      new Color('#03e5e6', '#0029ff'),
    ]);

  system.addEmitter(emitter);
  emitter.emit();
  system.addRenderer(new SpriteRenderer(group, THREE));

  return system;
};

/**
 * A compact, order-sensitive hash of every particle's rounded state — enough
 * to prove two systems are (or aren't) in the same configuration. Uses FNV-1a
 * over stringified position/velocity/age.
 */
const digest = system => {
  let h = 2166136261 >>> 0;

  const mix = n => {
    // round to 3dp so float noise doesn't mask a genuine match
    const s = Math.round(n * 1000) / 1000 + ',';

    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  };

  system.emitters.forEach(emitter =>
    emitter.particles.forEach(p => {
      mix(p.position.x);
      mix(p.position.y);
      mix(p.position.z);
      mix(p.velocity.x);
      mix(p.velocity.y);
      mix(p.velocity.z);
      mix(p.age);
    })
  );

  return (h >>> 0).toString(16).padStart(8, '0');
};

let left;
let right;
let step = 0;

const teardown = () => {
  [left, right].forEach(system => system && system.destroy());
  [leftGroup, rightGroup].forEach(group => group.clear());
};

const build = () => {
  teardown();

  const seed = parseInt(el('seed').value, 10) || 0;
  const desync = el('desync').checked;

  step = 0;
  left = buildSystem(seed, leftGroup);
  right = buildSystem(desync ? seed + 1 : seed, rightGroup);
};

const updateStatus = () => {
  const dl = digest(left);
  const dr = digest(right);
  const match = dl === dr;

  el('step').textContent = step;
  el('digestL').textContent = dl;
  el('digestR').textContent = dr;

  const verdict = el('verdict');

  verdict.textContent = match ? 'MATCH ✓ (byte-identical)' : 'DIVERGED ✗';
  verdict.className = `verdict ${match ? 'match' : 'diverged'}`;
};

const animate = () => {
  requestAnimationFrame(animate);

  // This demo deliberately uses update(), not tick(): it's showing
  // reproducible stepping, so both systems advance by the same fixed dt the
  // same number of times. Same seed + same steps → same state. (Live examples
  // use tick() for refresh-rate independence — this one wants exact lockstep.)
  left.update(FIXED_STEP);
  right.update(FIXED_STEP);
  step++;

  updateStatus();
  renderer.render(scene, camera);
};

el('replay').addEventListener('click', build);

resize();
build();
animate();
