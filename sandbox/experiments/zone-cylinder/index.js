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
  CylinderZone,
  GPURenderer,
} from 'three-nebula';
import { cylinder } from '/common/wireframe.js';
import { readZoneMotion } from '/common/zone-motion.js';
import { run } from '/common/run.js';

// CylinderZone — uniform emission within a solid cylinder (+Y). Static by default
// (reveals the volume); add ?vector-velocity=true (the whole column streams up as
// a beam), ?radial-velocity=true, and/or ?force=true.

const RADIUS = 90;
const HEIGHT = 260;
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
    .setRate(new Rate(new Span(26, 36), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(motion.moving ? 2.6 : 1.2, motion.moving ? 3.6 : 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new CylinderZone(0, 0, 0, RADIUS, HEIGHT)),
      ...motion.velocityInitializers,
    ])
    .setBehaviours([
      new Color('#bfffaf', '#39d060'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
      ...motion.forceBehaviours,
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(3030);
  scene.add(cylinder(RADIUS, HEIGHT));

  if (motion.moving) {
    camera.position.set(360, 220, 640);
    camera.lookAt(0, 160, 0);
  } else {
    camera.position.set(340, 150, 520);
    camera.lookAt(0, 0, 0);
  }

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

// A fixed 3/4 camera (the wireframe conveys the 3D shape) so OrbitControls drag
// works cleanly — matching every other experiment. The built-in auto-rotate
// (shouldRotateCamera) overrides the camera each frame and fights OrbitControls.
run(init, { shouldRotateCamera: false, shouldAddCameraControls: true });
