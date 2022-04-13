import ParticleSystem, {
  Alpha,
  Body,
  Color,
  Emitter,
  GPURenderer,
  Life,
  Mass,
  PointZone,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  Vector3D,
} from 'three-nebula';

import dot from '../../../assets/dot.png';

let THREE;
let hcolor = 0;
let tha = 0;
let ctha = 0;

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

const animate = ({ color1, color2, emitter, camera, scene }) => {
  hcolor += 0.01;
  tha += Math.PI / 150;
  ctha += 0.016;

  updateColors(color1, color2, hcolor);
  updateEmitter(emitter, tha);
  updateCamera(camera, scene, ctha);

  requestAnimationFrame(() =>
    animate({ color1, color2, emitter, camera, scene })
  );
};

const updateColors = (color1, color2, hcolor = 0) => {
  color1.setHSL(hcolor - (hcolor >> 0), 1, 0.5);
  color2.setHSL(hcolor - (hcolor >> 0) + 0.3, 1, 0.5);
};

const updateEmitter = (emitter, tha = 0) => {
  const p = 300 * Math.sin(2 * tha);

  emitter.position.x = p * Math.cos(tha);
  emitter.position.y = p * Math.sin(tha);
  emitter.position.z = (p * Math.tan(tha)) / 2;
};

const updateCamera = (camera, scene, ctha = 0) => {
  const radius = 300;

  camera.lookAt(scene.position);

  camera.position.x = Math.sin(ctha) * radius;
  camera.position.z = Math.cos(ctha) * radius;
  camera.position.y = Math.sin(ctha) * radius;
};

const createEmitter = (color1, color2) => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(2, 4), new Span(0.01)))
    .addInitializers([
      new Body(createSprite()),
      new Position(new PointZone(0, 0)),
      new Mass(1),
      new Radius(4, 8),
      new Life(3),
      new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
    ])
    .addBehaviours([
      new Alpha(1, 0),
      new Scale(2, 4),
      new Color(color1, color2),
    ])
    .emit();
};

export default async (three, { scene, camera, renderer }) => {
  THREE = three;

  const system = new ParticleSystem();
  const color1 = new THREE.Color();
  const color2 = new THREE.Color();
  const emitter = createEmitter(color1, color2);

  animate({ color1, color2, emitter, camera, scene });

  return system
    .addEmitter(emitter)
    .addRenderer(new GPURenderer(scene, renderer, THREE));
};
