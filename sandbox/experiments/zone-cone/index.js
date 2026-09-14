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
  ConeZone,
  GPURenderer,
} from 'three-nebula';
import { cone } from '/common/wireframe.js';
import { readZoneMotion } from '/common/zone-motion.js';
import { run } from '/common/run.js';

// ConeZone — uniform emission within a solid cone (apex at base, opening +Y).
// Static by default (reveals the volume); add ?vector-velocity=true (rise),
// ?radial-velocity=true (spray), and/or ?force=true (fountain).

const APEX_Y = -130;
const RADIUS = 130;
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
      new Position(new ConeZone(0, APEX_Y, 0, RADIUS, HEIGHT)),
      ...motion.velocityInitializers,
    ])
    .setBehaviours([
      new Color('#ffd27a', '#ff5a1a'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
      ...motion.forceBehaviours,
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(4040);

  const wire = cone(RADIUS, HEIGHT);

  wire.position.y = APEX_Y; // apex at (0, APEX_Y, 0), matching the zone
  scene.add(wire);

  if (motion.moving) {
    camera.position.set(360, 220, 640);
    camera.lookAt(0, 140, 0);
  } else {
    camera.position.set(0, 120, 520);
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
