import ParticleSystem, {
  Alpha,
  Body,
  Color,
  CrossZone,
  Emitter,
  Force,
  GPURenderer,
  Life,
  Mass,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  ScreenZone,
  Span,
  Vector3D,
} from 'three-nebula';

import dot from '../../../assets/dot.png';

let THREE;

const createSprite = () => {
  var map = new THREE.TextureLoader().load(dot);
  var material = new THREE.SpriteMaterial({
    map: map,
    color: 0xff0000,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  return new THREE.Sprite(material);
};

const createEmitter = ({ colorA, colorB, camera, renderer }) => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(5, 7), new Span(0.01, 0.02)))
    .setInitializers([
      new Mass(1),
      new Life(2),
      new Body(createSprite()),
      new Radius(80),
      new RadialVelocity(200, new Vector3D(0, 0, -1), 0),
    ])
    .setBehaviours([
      new Alpha(1, 0),
      new Color(colorA, colorB),
      new Scale(1, 0.5),
      new CrossZone(new ScreenZone(camera, renderer), 'dead'),
      new Force(0, 0, -20),
    ])
    .emit();
};

const animateEmitters = (a, b, tha = 0, radius = 70) => {
  tha += 0.13;

  a.position.x = radius * Math.cos(tha);
  a.position.y = radius * Math.sin(tha);

  b.position.x = radius * Math.cos(tha + Math.PI / 2);
  b.position.y = radius * Math.sin(tha + Math.PI / 2);

  requestAnimationFrame(() => animateEmitters(a, b, tha, radius));
};

export default async (three, { scene, camera, renderer }) => {
  THREE = three;

  const system = new ParticleSystem();
  const emitterA = createEmitter({
    colorA: '#4F1500',
    colorB: '#0029FF',
    camera,
    renderer,
  });
  const emitterB = createEmitter({
    colorA: '#004CFE',
    colorB: '#6600FF',
    camera,
    renderer,
  });

  animateEmitters(emitterA, emitterB);

  return system
    .addEmitter(emitterA)
    .addEmitter(emitterB)
    .addRenderer(new GPURenderer(scene, THREE));
};
