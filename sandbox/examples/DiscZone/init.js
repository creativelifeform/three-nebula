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
  DiscZone,
  SpriteRenderer,
} from 'three-nebula';

import dot from '../../assets/dot.png';

// DiscZone — uniform emission within a filled circle (XZ plane). Static fill so
// the golden master captures the zone's (uniform-area) sampling distribution.

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
    .setRate(new Rate(new Span(22, 30), new Span(0.004, 0.008)))
    .addInitializers([
      new Body(createSprite()),
      new Mass(1),
      new Life(1.5, 2.5),
      new Radius(4, 8),
      new Position(new DiscZone(0, 0, 0, 150)),
    ])
    .addBehaviours([
      new Color('#bfefff', '#39a0ff'),
      new Alpha(0.9, 0),
      new Scale(1, 0.6),
    ])
    .emit();

export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();

  camera.position.set(0, 240, 360);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createEmitter())
    .addRenderer(new SpriteRenderer(scene, THREE));
};
