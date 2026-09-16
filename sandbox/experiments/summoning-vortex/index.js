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
  Radius,
  Rate,
  Scale,
  Span,
  VectorVelocity,
  Vector3D,
  DiscZone,
  Vortex,
  GPURenderer,
} from 'three-nebula';
import { circle } from '/common/wireframe.js';
import { run } from '/common/run.js';

// Summoning Vortex — the hero for why decoupling position from direction beats the
// coupled "Shape" model. Particles are emitted across a flat DISC (the glyph on
// the ground), launched straight UP (a velocity initializer), then swept into a
// VORTEX behaviour that swirls them around the axis and pulls them inward — so
// they spiral up into a tornado that narrows as it rises.
//
// A coupled shape emitter can't express this: its launch velocity is tied to the
// shape (a disc/circle shape only pushes along its normal). Here the shape (disc),
// the launch (up), and the flow (swirl + inward pull) are three independent,
// composable pieces.

const CENTER = new Vector3D(0, 0, 0);
const UP = new Vector3D(0, 1, 0);
const RADIUS = 130;

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createVortex = () =>
  new Emitter()
    .setRate(new Rate(new Span(22, 30), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(3, 4), // long enough to spiral up several turns
      new Body(glow(0xffffff)),
      new Radius(4, 9),
      new Position(new DiscZone(0, 0, 0, RADIUS)), // the ground glyph (shape)
      new VectorVelocity(new Vector3D(0, 80, 0), 6), // an initial upward kick (direction)
    ])
    .setBehaviours([
      // Moderate swirl + strong inward pull → a converging (funnelling) spiral,
      // not a centrifugal spread; the sustained upward Force lifts it into a
      // tornado that narrows as it climbs.
      new Vortex(CENTER, UP, 300, 260, 1),
      new Force(0, 2.4, 0), // sustained lift (×100 MEASURE)
      new Color('#ffe08a', '#33ecff'), // warm glyph → arcane energy up top
      new Alpha(0.9, 0),
      new Scale(1, 0.45),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(70707);
  scene.add(circle(RADIUS)); // wireframe the disc the tornado rises from

  camera.position.set(340, 260, 660);
  camera.lookAt(0, 200, 0);

  return system
    .addEmitter(createVortex())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

// cameraTarget keeps OrbitControls focused on the column's mid-height (matching
// the camera's lookAt), so the first drag doesn't snap the view.
run(init, {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  cameraTarget: [0, 200, 0],
});
