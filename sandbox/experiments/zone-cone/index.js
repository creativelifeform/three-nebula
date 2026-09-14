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
import { run } from '/common/run.js';

// ConeZone — particles emitted uniformly within a solid cone: apex at the base,
// opening up +Y. A cone of cold / spray / fountain volume. Solid, so it also works
// as a CrossZone boundary via _dead (not shown here). Wireframe shows the cone.

const APEX_Y = -130;
const RADIUS = 130;
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
      new Position(new ConeZone(0, APEX_Y, 0, RADIUS, HEIGHT)),
    ])
    .setBehaviours([
      new Color('#ffd27a', '#ff5a1a'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

const init = async ({ scene, camera }) => {
  const system = new System();

  system.setSeed(4040);

  const wire = cone(RADIUS, HEIGHT);

  wire.position.y = APEX_Y; // apex at (0, APEX_Y, 0), matching the zone
  scene.add(wire);

  camera.position.set(0, 120, 520);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createFill())
    .addRenderer(new GPURenderer(scene, THREE, { maxParticles: 30000 }));
};

run(init, { shouldRotateCamera: true, shouldAddCameraControls: true });
