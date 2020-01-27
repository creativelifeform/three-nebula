const {
  Alpha,
  Body,
  Color,
  CrossZone,
  Emitter,
  Force,
  Life,
  Mass,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  ScreenZone,
  Span,
  SpriteRenderer,
  Vector3D,
  Position,
  SphereZone,
  RandomDrift,
  Gravity,
  ease,
} = window.Nebula;

const ParticleSystem = window.Nebula.default;

const createSprite = () => {
  const map = new THREE.TextureLoader().load('/assets/dot.png');
  const material = new THREE.SpriteMaterial({
    map: map,
    color: 0xff0000,
    blending: THREE.AdditiveBlending,
    fog: true,
  });

  return new THREE.Sprite(material);
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

window.init = ({ scene, camera }) => {
  const system = new ParticleSystem();
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new window.PointsRenderer(scene);
  const emitter = createEmitter();

  console.log(emitter.rate);

  camera.position.z = 500;

  return system.addEmitter(emitter).addRenderer(pointsRenderer);
};
