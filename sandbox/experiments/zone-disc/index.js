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
import { readZoneMotion } from '/common/zone-motion.js';
import { run } from '/common/run.js';

// DiscZone — uniform emission within a filled circle (XZ plane). Static by default
// (reveals the shape); add ?vector-velocity=true (rise into a column/beam),
// ?radial-velocity=true (dome spray), and/or ?force=true (fountain arc).

const RADIUS = 150;
const motion = readZoneMotion();

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
      new Life(motion.moving ? 2.6 : 1.2, motion.moving ? 3.6 : 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new DiscZone(0, 0, 0, RADIUS)),
      ...motion.velocityInitializers,
    ])
    .setBehaviours([
      new Color('#bfefff', '#39a0ff'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
      ...motion.forceBehaviours,
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(2020);
  scene.add(circle(RADIUS));

  if (motion.moving) {
    camera.position.set(360, 260, 620);
    camera.lookAt(0, 180, 0);
  } else {
    camera.position.set(0, 220, 520);
    camera.lookAt(0, 0, 0);
  }

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, {
  shouldRotateCamera: !motion.moving,
  shouldAddCameraControls: true,
});
