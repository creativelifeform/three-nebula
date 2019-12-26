import * as THREE from 'three';

import ParticleSystem, {
  Body,
  BoxZone,
  Emitter,
  Gravity,
  Life,
  Mass,
  MeshRenderer,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Rotate,
  Scale,
  Span,
  Vector3D,
} from 'three-nebula';

const { Mesh, SphereGeometry, BoxGeometry, MeshLambertMaterial } = THREE;

const createMesh = ({ geometry, material }) => new Mesh(geometry, material);

const createEmitter = ({ position, body }) => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(5, 10), new Span(0.1, 0.25)))
    .addInitializers([
      new Mass(1),
      new Radius(10),
      new Life(2, 4),
      new Body(body),
      new Position(new BoxZone(100)),
      new RadialVelocity(200, new Vector3D(0, 1, 1), 30),
    ])
    .addBehaviours([
      new Rotate('random', 'random'),
      new Scale(1, 0.1),
      new Gravity(3),
    ])
    .setPosition(position)
    .emit();
};

export default ({ scene, camera }) => {
  const system = new ParticleSystem();
  const sphereEmitter = createEmitter({
    position: {
      x: -100,
      y: 0,
    },
    body: createMesh({
      geometry: new SphereGeometry(10, 8, 8),
      material: new MeshLambertMaterial({ color: '#ff0000' }),
    }),
  });
  const cubeEmitter = createEmitter({
    position: {
      x: 100,
      y: 0,
    },
    body: createMesh({
      geometry: new BoxGeometry(20, 20, 20),
      material: new MeshLambertMaterial({ color: '#00ffcc' }),
    }),
  });

  camera.position.z = 400;
  camera.position.y = -100;

  return system
    .addEmitter(sphereEmitter)
    .addEmitter(cubeEmitter)
    .addRenderer(new MeshRenderer(scene, THREE));
};
