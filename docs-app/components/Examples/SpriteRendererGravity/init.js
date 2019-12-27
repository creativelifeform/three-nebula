import * as THREE from 'three';

import ParticleSystem, {
  Body,
  Color,
  Emitter,
  Gravity,
  Life,
  Mass,
  Position,
  RadialVelocity,
  RandomDrift,
  Rate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  ease,
} from 'three-nebula';

import dot from '../../../assets/dot.png';

const { TextureLoader, SpriteMaterial, Sprite, AdditiveBlending } = THREE;

const createSprite = () => {
  var map = new TextureLoader().load(dot);
  var material = new SpriteMaterial({
    map: map,
    color: 0xff0000,
    blending: AdditiveBlending,
    fog: true,
  });
  return new Sprite(material);
};

const createEmitter = () => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(10, 15), new Span(0.05, 0.1)))
    .addInitializers([
      new Body(createSprite()),
      new Mass(1),
      new Life(1, 3),
      new Position(new SphereZone(20)),
      new RadialVelocity(new Span(500, 800), new Vector3D(0, 1, 0), 30),
    ])
    .addBehaviours([
      new RandomDrift(10, 10, 10, 0.05),
      new Scale(new Span(2, 3.5), 0),
      new Gravity(6),
      new Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, ease.easeOutSine),
    ])
    .setPosition({ x: 0, y: -150 })
    .emit();
};

export default ({ scene, camera }) => {
  const system = new ParticleSystem();

  camera.position.z = 500;

  return system
    .addEmitter(createEmitter())
    .addRenderer(new SpriteRenderer(scene, THREE));
};
