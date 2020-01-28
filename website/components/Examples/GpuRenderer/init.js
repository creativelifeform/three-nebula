// import ParticleSystem, {
//   Alpha,
//   Color,
//   Emitter,
//   GPURenderer,
//   Life,
//   Mass,
//   PointZone,
//   Position,
//   RadialVelocity,
//   Radius,
//   Rate,
//   Scale,
//   Span,
//   SpriteRenderer,
//   Vector3D,
// } from 'three-nebula';
//
// let THREE;
// let hcolor = 0;
// let tha = 0;
// let ctha = 0;
//
// const animate = ({ color1, color2, emitter, camera, scene }) => {
//   hcolor += 0.01;
//   tha += Math.PI / 150;
//   ctha += 0.016;
//
//   updateColors(color1, color2, hcolor);
//   updateEmitter(emitter, tha);
//   updateCamera(camera, scene, ctha);
//
//   requestAnimationFrame(() =>
//     animate({ color1, color2, emitter, camera, scene })
//   );
// };
//
// const updateColors = (color1, color2, hcolor = 0) => {
//   color1.setHSL(hcolor - (hcolor >> 0), 1, 0.5);
//   color2.setHSL(hcolor - (hcolor >> 0) + 0.3, 1, 0.5);
// };
//
// const updateEmitter = (emitter, tha = 0) => {
//   const p = 300 * Math.sin(2 * tha);
//
//   emitter.position.x = p * Math.cos(tha);
//   emitter.position.y = p * Math.sin(tha);
//   emitter.position.z = (p * Math.tan(tha)) / 2;
// };
//
// const updateCamera = (camera, scene, ctha = 0) => {
//   const radius = 300;
//
//   camera.lookAt(scene.position);
//
//   camera.position.x = Math.sin(ctha) * radius;
//   camera.position.z = Math.cos(ctha) * radius;
//   camera.position.y = Math.sin(ctha) * radius;
// };
//
// const createEmitter = (color1, color2) => {
//   const emitter = new Emitter();
//
//   return emitter
//     .setRate(new Rate(new Span(4, 16), new Span(0.01)))
//     .addInitializers([
//       new Position(new PointZone(0, 0)),
//       new Mass(1),
//       new Radius(6, 12),
//       new Life(3),
//       new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
//     ])
//     .addBehaviours([
//       new Alpha(1, 0),
//       new Scale(0.3, 0.6),
//       new Color(color1, color2),
//     ])
//     .emit();
// };
//
// export default async (three, { scene, camera }) => {
//   THREE = three;
//
//   const system = new ParticleSystem();
//   const color1 = new THREE.Color();
//   const color2 = new THREE.Color();
//   const emitter = createEmitter(color1, color2);
//
//   animate({ color1, color2, emitter, camera, scene });
//
//   return system.addEmitter(emitter).addRenderer(new GPURenderer(scene, THREE));
// };

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
