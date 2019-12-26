import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three';
import ParticleSystem, {
  BoxZone,
  Color,
  CrossZone,
  CustomRenderer,
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

const createEmitter = () => {
  const emitter = new Emitter();
  const zone = new BoxZone(600);

  zone.friction = 0.95;
  zone.max = 7;

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

export default async scene => {
  const system = new ParticleSystem();
  const renderer = new CustomRenderer();
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial());

  system.addEmitter(createEmitter());

  renderer.onParticleCreated = function(p) {
    p.target = this.targetPool.get(mesh);
    p.target.position.copy(p.position);
    scene.add(p.target);
  };

  renderer.onParticleUpdate = function(p) {
    p.target.position.copy(p.position);
    p.target.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);

    const scale = p.scale * 30;
    p.target.scale.set(scale, scale, scale);
  };

  renderer.onParticleDead = function(p) {
    this.targetPool.expire(p.target);
    scene.remove(p.target);
    p.target = null;
  };

  system.addRenderer(renderer);

  return system;
};
