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
import { run } from '/common/run.js';

// RingZone — particles emitted uniformly within an annulus (XZ plane). The dim
// wireframe shows the zone; particles have no velocity, so they simply reveal the
// emission shape (a glowing summoning ring / frost nova footprint).

const INNER = 90;
const OUTER = 150;

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
      new Life(1.2, 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new RingZone(0, 0, 0, INNER, OUTER)),
    ])
    .setBehaviours([
      new Color('#ffe08a', '#ff8a1a'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(1010);
  scene.add(ring(INNER, OUTER));

  camera.position.set(0, 220, 520);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, { shouldRotateCamera: true, shouldAddCameraControls: true });
