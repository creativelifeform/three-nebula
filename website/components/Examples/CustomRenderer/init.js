import ParticleSystem, {
  BoxZone,
  Color,
  CrossZone,
  CustomRenderer,
  Debug,
  Emitter,
  Gravity,
  Life,
  Mass,
  RadialVelocity,
  Radius,
  Rate,
  Rotate,
  Scale,
  Span,
  Vector3D,
  ease,
} from 'three-nebula';

let THREE;

const createDebugger = ({ THREE: three, system, scene, zone }) => {
  Debug.drawZone(three, system, scene, zone);
};

const createZone = () => {
  const zone = new BoxZone(600);

  zone.friction = 0.95;
  zone.max = 7;

  return zone;
};

const createEmitter = zone => {
  const emitter = new Emitter();

  emitter
    .setRate(new Rate(new Span(4, 8), new Span(0.2, 0.5)))
    .addInitializers([
      new Mass(1),
      new Radius(100),
      new Life(2, 4),
      new RadialVelocity(400, new Vector3D(0, 1, 0), 60),
    ])
    .addBehaviours([
      new Rotate('random', 'random'),
      new Scale(1, 0.1),
      new Gravity(6),
      new CrossZone(zone, 'bound'),
      new Color(0xff0000, 'random', Infinity, ease.easeOutQuart),
    ])
    .setPosition({ x: 0, y: 0 })
    .emit();

  return emitter;
};

export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();
  const renderer = new CustomRenderer();
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
  );
  const zone = createZone();
  const emitter = createEmitter(zone);

  renderer.onParticleCreated = function(p) {
    p.target = this.targetPool.get(mesh);

    p.target.position.copy(p.position);
    scene.add(p.target);
  };

  renderer.onParticleUpdate = function(p) {
    const scale = p.scale * 30;

    p.target.position.copy(p.position);
    p.target.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
    p.target.scale.set(scale, scale, scale);
  };

  renderer.onParticleDead = function(p) {
    this.targetPool.expire(p.target);
    scene.remove(p.target);

    p.target = null;
  };

  system.addEmitter(emitter).addRenderer(renderer);

  createDebugger({ THREE, system, scene, zone });

  camera.position.z = 500;

  return system;
};
