import ParticleSystem, {
  Alpha,
  Body,
  Color,
  Emitter,
  Force,
  Life,
  Mass,
  Position,
  Radius,
  Rate,
  Scale,
  Span,
  SphereZone,
  VectorVelocity,
  Vector3D,
  SpriteRenderer,
  CurlNoise,
} from 'three-nebula';

import dot from '../../assets/dot.png';

// CurlNoise behaviour — a column of energy that rises and roils under a coherent,
// divergence-free turbulence field. SpriteRenderer so the VR golden master
// (SwiftShader) renders faithfully.

let THREE;

const createSprite = () => {
  const material = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(dot),
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Sprite(material);
};

const createColumn = () =>
  new Emitter()
    .setRate(new Rate(new Span(14, 20), new Span(0.006, 0.012)))
    .addInitializers([
      new Mass(1),
      new Life(3.2, 4.4),
      new Body(createSprite()),
      new Radius(7, 15),
      new Position(new SphereZone(0, -200, 0, 55)),
      new VectorVelocity(new Vector3D(0, 110, 0), 24),
    ])
    .addBehaviours([
      new CurlNoise(0.008, 420, 1337),
      new Force(0, 10, 0),
      new Color('#ff9d2f', '#8a1bff'),
      new Alpha(0.9, 0),
      new Scale(1, 0.35),
    ])
    .emit();

export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();

  camera.position.set(0, 0, 620);
  camera.lookAt(0, 0, 0);

  return system
    .addEmitter(createColumn())
    .addRenderer(new SpriteRenderer(scene, THREE));
};
