import ParticleSystem, {
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
  SpriteRenderer,
} from 'three-nebula';

import dot from '../../assets/dot.png';

// CylinderZone — uniform emission within a solid cylinder (+Y). Static fill so the
// golden master captures the volume's sampling distribution.

let THREE;

const createSprite = () => {
  const material = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(dot),
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    fog: true,
  });

  return new THREE.Sprite(material);
};

const createEmitter = () =>
  new Emitter()
    .setRate(new Rate(new Span(24, 32), new Span(0.004, 0.008)))
    .addInitializers([
      new Body(createSprite()),
      new Mass(1),
      new Life(1.5, 2.5),
      new Radius(4, 8),
      new Position(new CylinderZone(0, 0, 0, 90, 260)),
    ])
    .addBehaviours([
      new Color('#bfffaf', '#39d060'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();

  camera.position.set(0, 60, 460);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createEmitter())
    .addRenderer(new SpriteRenderer(scene, THREE));
};
