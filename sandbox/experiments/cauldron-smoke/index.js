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
  SphereZone,
  VectorVelocity,
  Vector3D,
  GPURenderer,
  CurlNoise,
} from 'three-nebula';
import { run } from '/common/run.js';

// Cauldron Smoke — eerie magic smoke curling up off a brew. This is curl noise in
// its original role (Bridson 2007): a rising plume where the divergence-free field
// makes the smoke lick and fold instead of streaming straight up.

const smoke = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createBrew = () =>
  new Emitter()
    .setRate(new Rate(new Span(16, 24), new Span(0.006, 0.012)))
    .setInitializers([
      new Mass(1),
      new Life(3.4, 4.6),
      new Body(smoke(0xffffff)),
      new Radius(10, 20), // fatter, smokier puffs
      new Position(new SphereZone(0, -210, 0, 45)), // the cauldron mouth
      new VectorVelocity(new Vector3D(0, 90, 0), 18), // slow rise
    ])
    .setBehaviours([
      new CurlNoise(0.009, 340, 66), // billowing curl
      new Force(0, 8, 0), // buoyancy
      new Color('#7bff5a', '#6a1bff'), // witch-green → arcane violet
      new Alpha(0.75, 0),
      new Scale(0.8, 1.6), // expand as it rises (smoke spreads)
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(1312);

  camera.position.set(0, 0, 620);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createBrew())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 24000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
