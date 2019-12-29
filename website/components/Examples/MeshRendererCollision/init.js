import * as THREE from 'three';

import ParticleSystem, {
  Body,
  Collision,
  Emitter,
  Gravity,
  Life,
  Mass,
  MeshRenderer,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  Vector3D,
} from 'three-nebula';

const { Mesh, SphereGeometry, MeshStandardMaterial } = THREE;

const createEmitter = () => {
  const emitter = new Emitter();
  const sphere = new Mesh(
    new SphereGeometry(100, 24, 24),
    new MeshStandardMaterial({
      color: 0x2170ce,
      metalness: 0.5,
      wireframe: true,
    })
  );

  return emitter
    .setRate(new Rate(new Span(2, 5), new Span(0.5, 1)))
    .addInitializers([
      new Mass(1),
      new Radius(100),
      new Life(10, 20),
      new Body(sphere),
      new RadialVelocity(new Span(300, 500), new Vector3D(0, 1, 0), 30),
    ])
    .addBehaviours([new Scale(1), new Gravity(3), new Collision(emitter)])
    .emit();
};

export default ({ scene, camera }) => {
  const system = new ParticleSystem();

  camera.position.z = 750;

  return system
    .addEmitter(createEmitter())
    .addRenderer(new MeshRenderer(scene, THREE));
};
