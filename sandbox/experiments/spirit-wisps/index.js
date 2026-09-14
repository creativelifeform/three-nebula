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
  GPURenderer,
  CurlNoise,
} from 'three-nebula';
import { run } from '/common/run.js';

// Spirit Wisps — glowing motes adrift in a volume, swirling gently in place on a
// curl-noise breeze (the ambient forest-spore look). There is no dominant
// direction: the divergence-free swirl is the whole effect, so nothing streams
// off one side. A whisper of buoyancy lets them rise like spores.

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createWisps = () =>
  new Emitter()
    .setRate(new Rate(new Span(16, 24), new Span(0.008, 0.02)))
    .setInitializers([
      new Mass(1),
      new Life(6, 10), // long-lived, so the volume stays densely populated
      new Body(glow(0xffffff)),
      new Radius(8, 16), // bigger, brighter motes
      new Position(new SphereZone(300)), // motes fill a volume
    ])
    .setBehaviours([
      new CurlNoise(0.006, 150, 7), // gentle, large-scale swirl
      new Force(0, 2, 0), // the faintest drift, so they stay spread out
      new Color('#aeffd8', '#2effa0'), // pale green → spirit teal
      new Alpha(0.9, 0),
      new Scale(0.6, 1.2), // bloom in as they drift
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(31415);

  camera.position.set(0, 0, 640);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createWisps())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 20000 }));
};

run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
