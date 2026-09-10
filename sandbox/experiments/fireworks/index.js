import * as THREE from 'three';
import System, {
  Alpha,
  Body,
  Color,
  Emitter,
  Force,
  Life,
  Mass,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  GPURenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Emitter events (spec 01, Stage 5). Each rocket is a parent emitter whose
// particles rise and die mid-air; a `trigger: 'death'` child bursts a shell of
// sparks at the death position and outlives the rocket. Unlike attachment
// (Stages 2–3), the burst is instanced *at death*, not birth. One GPURenderer
// draws rockets and sparks alike (points), so no per-emitter routing is needed.

const PALETTE = [
  ['#fff6a0', '#ff5a3c'], // gold → red
  ['#a0f0ff', '#2a6cff'], // cyan → blue
  ['#ffc0f0', '#c030ff'], // pink → purple
];

const UP = new Vector3D(0, 1, 0);
const BASE_Y = -150;

const createSprite = () => {
  const map = new THREE.TextureLoader().load('/assets/dot.png');

  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      fog: true,
    })
  );
};

// The shell: a one-shot radial burst that fires when its rocket dies.
const createBurst = ([colorA, colorB]) => {
  const burst = new Emitter();

  burst
    .setRate(new Rate(new Span(60, 90), new Span(0.01, 0.01)))
    .setInitializers([
      new Mass(1),
      new Life(1, 1.7),
      new Body(createSprite()),
      new Radius(6, 12),
      new RadialVelocity(new Span(130, 230), UP, 180), // omnidirectional
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Color(colorA, colorB),
      new Scale(1, 0.3),
      // Force is scaled ×100 internally (MEASURE), so this is ~100 units/s² down.
      new Force(0, -1, 0),
    ]);

  burst.trigger = 'death'; // instanced at the rocket's death, not its birth
  burst.emit(1); // one-shot

  return burst;
};

// The rocket: rises from the base, arcs under gravity, dies mid-air.
const createRocket = (palette, x) => {
  const rocket = new Emitter();

  rocket
    .setRate(new Rate(new Span(1, 1), new Span(0.7, 1.1)))
    .setInitializers([
      new Mass(1),
      new Life(1, 1.4),
      new Body(createSprite()),
      new Radius(7, 11),
      new RadialVelocity(300, UP, 18),
    ])
    .setBehaviours([
      new Alpha(1, 0.7),
      new Color('#ffffff', palette[0]),
      new Scale(1, 0.6),
      // ~160 units/s² down (×100 MEASURE); rocket dies while still rising.
      new Force(0, -1.6, 0),
    ]);

  rocket.setPosition({ x, y: BASE_Y });
  rocket.addChild(createBurst(palette));

  return rocket.emit();
};

const init = async ({ scene, camera }) => {
  const system = new System();
  const spread = [-150, 0, 150];

  PALETTE.forEach((palette, i) =>
    system.addEmitter(createRocket(palette, spread[i]))
  );
  system.addRenderer(new GPURenderer(scene, THREE));

  camera.position.set(0, 20, 560);
  camera.lookAt(0, 20, 0);

  return system;
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
