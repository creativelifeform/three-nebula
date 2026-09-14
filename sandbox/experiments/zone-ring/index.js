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
  RingZone,
  GPURenderer,
} from 'three-nebula';
import { ring } from '/common/wireframe.js';
import { readZoneMotion } from '/common/zone-motion.js';
import { run } from '/common/run.js';

// RingZone — particles emitted uniformly within an annulus (XZ plane). The dim
// wireframe shows the zone. By default the particles are stationary (they reveal
// the emission shape); add ?vector-velocity=true (rise into a fire wall),
// ?radial-velocity=true, and/or ?force=true (arc back down) to see "emit in the
// shape, then travel" — position and launch direction are decoupled.

const INNER = 90;
const OUTER = 150;
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
    .setRate(new Rate(new Span(22, 30), new Span(0.004, 0.008)))
    .setInitializers([
      new Mass(1),
      new Life(motion.moving ? 2.6 : 1.2, motion.moving ? 3.6 : 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new RingZone(0, 0, 0, INNER, OUTER)),
      ...motion.velocityInitializers,
    ])
    .setBehaviours([
      new Color('#ffe08a', '#ff8a1a'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
      ...motion.forceBehaviours,
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(1010);
  scene.add(ring(INNER, OUTER));

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

// Orbit to show the flat shape when static; hold a fixed 3/4 framing when the
// particles travel (so the rising column stays in frame).
run(init, {
  shouldRotateCamera: !motion.moving,
  shouldAddCameraControls: true,
});
