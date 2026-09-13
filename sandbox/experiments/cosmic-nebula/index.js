import * as THREE from 'three';
import System, {
  Alpha,
  Body,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  Radius,
  Rate,
  Scale,
  Span,
  SphereZone,
  Vector3D,
  GPURenderer,
  CurlNoise,
  Vortex,
} from 'three-nebula';
import { run } from '/common/run.js';

// Cosmic Nebula — a slowly rotating cloud of gas and dust. Two of the new flow
// behaviours compose here: Vortex gives the whole cloud its galactic spin (plus a
// faint inward pull so it holds together), while CurlNoise carves the roiling
// filaments and eddies inside it. Big, soft, low-alpha dots layer additively into
// gas.

const CENTER = new Vector3D(0, 0, 0);
const AXIS = new Vector3D(0, 0, 1); // spin faces the camera

const gas = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createCloud = (colorA, colorB, seed) =>
  new Emitter()
    .setRate(new Rate(new Span(10, 16), new Span(0.01, 0.02)))
    .setInitializers([
      new Mass(1),
      new Life(9, 14), // very long-lived → a persistent cloud
      new Body(gas(0xffffff)),
      new Radius(14, 30), // big, soft, overlapping
      new Position(new SphereZone(360)),
    ])
    .setBehaviours([
      new Vortex(CENTER, AXIS, 240, 12, 1), // galactic spin + faint cohesion
      new CurlNoise(0.004, 90, seed), // roiling filaments
      new Color(colorA, colorB),
      new Alpha(0.35, 0), // low alpha → gaseous build-up
      new Scale(1, 1.5),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(2718);

  camera.position.set(0, 0, 720);
  camera.lookAt(0, 0, 0);

  // Two colour populations interleaved → a deep-blue cloud shot through with
  // magenta and cyan.
  return system
    .addEmitter(createCloud('#1b2aff', '#ff3db0', 3)) // blue → magenta
    .addEmitter(createCloud('#12103a', '#39e6ff', 8)) // dark → cyan
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 40000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
