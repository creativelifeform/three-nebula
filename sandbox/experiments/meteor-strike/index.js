import * as THREE from 'three';
import System, {
  Alpha,
  Body,
  Color,
  Emitter,
  Force,
  Life,
  Mass,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  LineZone,
  VectorVelocity,
  GPURenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Meteor Strike — the full emitter hierarchy in one shot. A parent "sky" emitter
// rains meteors; each meteor particle carries a `spawn` child (ember trail that
// rides it) and a `death` child (impact burst that fires where it lands and
// outlives it). All particles are GPU points, so a single GPURenderer draws
// meteors, trails and bursts — no per-emitter routing needed. Motion is
// sim-driven (velocity + gravity), so it captures deterministically at 60fps.

const UP = new Vector3D(0, 1, 0);
const GROUND = -140;

const fire = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

// Ember trail: rides the meteor (position: always), sheds cooling embers that
// drift up and fade — the streak behind the head.
const createTrail = () => {
  const trail = new Emitter();

  trail
    .setRate(new Rate(new Span(3, 5), new Span(0.003, 0.006)))
    .setInitializers([
      new Mass(1),
      new Life(0.35, 0.7),
      new Body(fire(0xff8a3c)),
      new Radius(7, 14),
    ])
    .setBehaviours([
      new Alpha(0.9, 0),
      new Color('#ffbf5a', '#7a1400'), // hot amber → cooled ember
      new Scale(1, 0.2),
      new Force(0, 0.6, 0), // embers rise as they cool
    ]);
  trail.inherit = { position: 'always', rotation: 'none', scale: 'none' };
  trail.orphanPolicy = 'detach';
  trail.emit(Infinity, Infinity);

  return trail;
};

// Impact burst: instanced at the meteor's death, one-shot shower of sparks that
// arc up and fall back under gravity.
const createImpact = () => {
  const burst = new Emitter();

  burst
    .setRate(new Rate(new Span(44, 64), new Span(0.01, 0.01)))
    .setInitializers([
      new Mass(1),
      new Life(0.6, 1.2),
      new Body(fire(0xffd070)),
      new Radius(6, 15),
      new RadialVelocity(new Span(160, 340), UP, 88), // upward hemisphere
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Color('#fff2a0', '#ff3b00'),
      new Scale(1, 0.2),
      new Force(0, -2.4, 0), // gravity (×100 MEASURE)
    ]);
  burst.trigger = 'death';
  burst.emit(1);

  return burst;
};

// The sky: meteors spawn along a high line and fall as parallel streaks.
const createSky = () => {
  const sky = new Emitter();

  sky
    .setRate(new Rate(new Span(1, 1), new Span(0.11, 0.19)))
    .setInitializers([
      new Mass(1),
      new Life(0.85, 1.05), // dies near the ground → burst there
      new Body(fire(0xffffff)),
      new Radius(14, 22),
      new Position(new LineZone(-360, 240, 0, 360, 240, 0)),
      new VectorVelocity(new Vector3D(-70, -300, 0), 5),
    ])
    .setBehaviours([
      new Alpha(1, 0.85),
      new Color('#ffffff', '#ffab30'), // white-hot → amber
      new Scale(1.2, 0.7),
      new Force(0, -2, 0),
    ]);

  sky.addChild(createTrail());
  sky.addChild(createImpact());

  return sky.emit();
};

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(31415);
  camera.position.set(0, 20, 500);
  camera.lookAt(0, 20, 0);

  // A faint ground line for the meteors to strike.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 4),
    new THREE.MeshBasicMaterial({
      color: 0x221133,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    })
  );
  ground.position.set(0, GROUND, 0);
  scene.add(ground);

  return system
    .addEmitter(createSky())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
