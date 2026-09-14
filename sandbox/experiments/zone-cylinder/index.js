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
import { run } from '/common/run.js';

// CylinderZone — particles emitted uniformly within a solid cylinder (centred on
// the origin, +Y). A pillar / column / beam volume. Solid, so it also works as a
// CrossZone boundary (not shown here). Wireframe shows the cylinder.

const RADIUS = 90;
const HEIGHT = 260;

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
      new Life(1.2, 2),
      new Body(glow(0xffffff)),
      new Radius(3, 6),
      new Position(new CylinderZone(0, 0, 0, RADIUS, HEIGHT)),
    ])
    .setBehaviours([
      new Color('#bfffaf', '#39d060'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(3030);
  scene.add(cylinder(RADIUS, HEIGHT));

  camera.position.set(0, 120, 520);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, { shouldRotateCamera: true, shouldAddCameraControls: true });
