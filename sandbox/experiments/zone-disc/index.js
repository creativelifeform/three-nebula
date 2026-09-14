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
  DiscZone,
  GPURenderer,
} from 'three-nebula';
import { circle } from '/common/wireframe.js';
import { run } from '/common/run.js';

// DiscZone — particles emitted uniformly within a filled circle (XZ plane), a
// RingZone with inner radius 0. Uniform-area sampling → no clustering at the
// centre. The wireframe circle shows the disc.

const RADIUS = 150;

const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/dot.png'),
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

const createFill = () =>
  new Emitter()
    .setRate(new Rate(new Span(24, 32), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(1.2, 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new DiscZone(0, 0, 0, RADIUS)),
    ])
    .setBehaviours([
      new Color('#bfefff', '#39a0ff'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(2020);
  scene.add(circle(RADIUS));

  camera.position.set(0, 220, 520);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, { shouldRotateCamera: true, shouldAddCameraControls: true });
