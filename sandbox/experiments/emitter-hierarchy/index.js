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

// Emitter hierarchy (spec 01): the parent "sparks" emitter throws sprites
// outward; each spark rides a child "smoke" emitter (inherit.position: 'always',
// orphanPolicy: 'detach') so the smoke follows its spark and lives on after the
// spark dies. One child node → one live instance per spark, all recycled through
// the Stage 1 pool.

const createSprite = color => {
  const map = new THREE.TextureLoader().load('/assets/dot.png');

  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      color,
      blending: THREE.AdditiveBlending,
      fog: true,
    })
  );
};

// The child: a slow, greying puff that trails whichever spark spawned it.
const createSmokeTrail = () => {
  const smoke = new Emitter();

  smoke
    .setRate(new Rate(new Span(1, 2), new Span(0.02, 0.04)))
    .setInitializers([
      new Mass(1),
      new Life(0.6, 1.1),
      new Body(createSprite(0x888888)),
      new Radius(16, 32),
      new RadialVelocity(15, new Vector3D(0, 1, 0), 30),
    ])
    .setBehaviours([
      new Alpha(0.35, 0),
      new Scale(0.5, 1.6),
      new Color('#aaaaaa', '#222222'),
    ]);

  // Follow the parent spark every frame; let emitted smoke outlive the spark.
  smoke.inherit = { position: 'always', rotation: 'none', scale: 'none' };
  smoke.orphanPolicy = 'detach';
  smoke.emit(Infinity, Infinity);

  return smoke;
};

// The parent: bright, fast sparks under gravity, each carrying a smoke child.
const createSparks = () => {
  const sparks = new Emitter();

  sparks
    .setRate(new Rate(new Span(2, 4), new Span(0.06, 0.1)))
    .setInitializers([
      new Mass(1),
      new Life(1.1, 1.7),
      new Body(createSprite(0xffcc33)),
      new Radius(26, 46),
      new RadialVelocity(220, new Vector3D(0, 1, 0), 55),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Scale(1, 0.25),
      new Color('#fffb00', '#ff3c00'),
      new Force(0, -140, 0),
    ]);

  sparks.addChild(createSmokeTrail());

  return sparks.emit();
};

const init = async ({ scene }) => {
  const system = new System();

  return system
    .addEmitter(createSparks())
    .addRenderer(new GPURenderer(scene, THREE));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
