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
  RandomDrift,
  Rate,
  Scale,
  SphereZone,
  Span,
  VectorVelocity,
  GPURenderer,
  Vector3D,
} from 'three-nebula';
import { run } from '/common/run.js';

// Healing aura — a designed showcase of the emitter hierarchy (spec 01).
//
// A ground cluster lifts soft green→gold "motes" (parent). Each mote rides a
// child "sparkle" emitter that inherits its transform, so the sparkles ride the
// mote up the column and — because scale is inherited — shrink as the mote fades.
// orphanPolicy 'detach' lets a mote's sparkles twinkle out on their own after the
// mote dies. One child node → one live sparkle emitter per mote, all recycled
// through the pool.
//
// Append ?position=onCreate to switch the sparkles from riding the mote (a
// trailing shimmer) to snapping to where the mote was born (a standing pillar of
// light) — the Stage 3 always↔onCreate contrast.
const positionMode =
  new URLSearchParams(window.location.search).get('position') === 'onCreate'
    ? 'onCreate'
    : 'always';

const BASE_Y = -120;

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

// The child: a small, bright twinkle that rides (or is left behind by) its mote.
const createSparkles = () => {
  const sparkles = new Emitter();

  sparkles
    .setRate(new Rate(new Span(1, 2), new Span(0.03, 0.06)))
    .setInitializers([
      new Mass(1),
      new Life(0.35, 0.7),
      new Body(createSprite(0xffffff)),
      new Radius(3, 6),
      new RadialVelocity(16, new Vector3D(0, 1, 0), 70),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Color('#ffffff', '#ffd86b'),
      new Scale(1, 0.1),
    ]);

  // Ride the mote (position) and shrink with it (scale); linger after it dies.
  sparkles.inherit = {
    position: positionMode,
    rotation: 'none',
    scale: 'always',
  };
  sparkles.orphanPolicy = 'detach';
  sparkles.emit(Infinity, Infinity);

  return sparkles;
};

// The parent: soft motes rising from a base cluster, greening into gold.
const createMotes = () => {
  const motes = new Emitter();

  motes
    .setRate(new Rate(new Span(3, 5), new Span(0.02, 0.04)))
    .setInitializers([
      new Mass(1),
      new Life(1.6, 2.6),
      new Body(createSprite(0xffffff)),
      new Radius(8, 16),
      new Position(new SphereZone(45)),
      new VectorVelocity(new Vector3D(0, 90, 0), 25),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Color('#7cffb0', '#ffe68a'),
      new Scale(0.7, 1.5),
      new RandomDrift(18, 8, 18, 0.1),
      new Force(0, 30, 0),
    ]);

  motes.setPosition({ x: 0, y: BASE_Y, z: 0 });
  motes.addChild(createSparkles());

  return motes.emit();
};

const init = async ({ scene }) => {
  const system = new System();

  return system
    .addEmitter(createMotes())
    .addRenderer(new GPURenderer(scene, THREE));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
