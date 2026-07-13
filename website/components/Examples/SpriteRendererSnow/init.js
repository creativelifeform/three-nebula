import ParticleSystem, {
  Body,
  BoxZone,
  CrossZone,
  Emitter,
  Gravity,
  Life,
  Mass,
  Position,
  RadialVelocity,
  Radius,
  RandomDrift,
  Rate,
  Rotate,
  ScreenZone,
  Span,
  SpriteRenderer,
  Vector3D,
} from 'three-nebula';

import snow from '../../../assets/snow.png';

let THREE;

const createPlane = () => {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000, 9, 24),
    new THREE.MeshLambertMaterial({
      color: '#3c5887',
      fog: false,
    })
  );

  // three r125+ removed Geometry; PlaneGeometry is a BufferGeometry now, so
  // displace the position attribute's z instead of the old .vertices array.
  const position = plane.geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const y = Math.floor(i / 10);
    const x = i - y * 10;

    let z;
    if (x === 4 || x === 5) {
      z = 0;
    } else {
      z = Math.random() * 480 - 240;
    }

    if (y === 0 || y === 24) {
      z = -60;
    }

    position.setZ(i, z);
  }

  position.needsUpdate = true;

  plane.rotation.x = -Math.PI / 3;
  plane.position.y = -200;

  return plane;
};

const createSnow = () => {
  var map = new THREE.TextureLoader().load(snow);
  var material = new THREE.SpriteMaterial({
    map: map,
    transparent: true,
    opacity: 0.5,
    color: 0xffffff,
  });
  return new THREE.Sprite(material);
};

const createEmitter = (camera, renderer) => {
  const emitter = new Emitter();
  const position = new Position();

  position.addZone(new BoxZone(2500, 10, 2500));

  return emitter
    .setRate(new Rate(new Span(34, 48), new Span(0.2, 0.5)))
    .addInitializers([
      new Mass(1),
      new Radius(new Span(10, 20)),
      position,
      new Life(5, 10),
      new Body(createSnow()),
      new RadialVelocity(0, new Vector3D(0, -1, 0), 90),
    ])
    .addBehaviours([
      new RandomDrift(10, 1, 10, 0.05),
      new Rotate('random', 'random'),
      new Gravity(2),
      new CrossZone(new ScreenZone(camera, renderer, 20, '234'), 'dead'),
    ])
    .setPosition({ y: 800 })
    .emit();
};

export default async (three, { scene, camera, renderer }) => {
  THREE = three;

  // Frame the large snow field (the example relied on a full-page canvas and
  // never set a camera).
  camera.position.set(0, 100, 1000);

  const system = new ParticleSystem();

  scene.add(createPlane());

  return system
    .addEmitter(createEmitter(camera, renderer))
    .addRenderer(new SpriteRenderer(scene, THREE));
};
