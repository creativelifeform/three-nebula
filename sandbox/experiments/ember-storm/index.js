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
  LineZone,
  VectorVelocity,
  Vector3D,
  GPURenderer,
  CurlNoise,
} from 'three-nebula';
import { run } from '/common/run.js';

// Ember Storm — sparks and embers streaming across the frame on a turbulent
// breeze. A steady wind (VectorVelocity) carries them up and across; the
// curl-noise field breaks the stream into swirling eddies so it reads as live,
// drifting embers rather than a straight jet.

const spark = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createEmbers = () =>
  new Emitter()
    .setRate(new Rate(new Span(30, 42), new Span(0.004, 0.009)))
    .setInitializers([
      new Mass(1),
      new Life(2.6, 3.8),
      new Body(spark(0xffffff)),
      new Radius(4, 9), // small, bright sparks
      new Position(new LineZone(-460, -240, 0, 460, -240, 0)), // a wide floor source
      new VectorVelocity(new Vector3D(140, 80, 0), 30), // a driving cross-wind
    ])
    .setBehaviours([
      new CurlNoise(0.012, 320, 21), // stronger eddies that break up the stream
      new Force(0, 5, 0), // a little lift
      new Color('#ffe08a', '#ff4d1a'), // hot yellow → ember red
      new Alpha(0.95, 0),
      new Scale(1, 0.35), // sparks shrink as they cool
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(90210);

  camera.position.set(0, 0, 640);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createEmbers())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 24000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
