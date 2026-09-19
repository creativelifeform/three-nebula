import ParticleSystem, {
  Alpha,
  Body,
  Color,
  Emitter,
  Life,
  Mass,
  Position,
  Radius,
  Rate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  Vortex,
} from 'three-nebula';

import dot from '../../assets/dot.png';

// Vortex behaviour — energy spawns across a sphere and is swirled around the
// view axis with an inward pull, spiralling toward the centre as it converges.
// Uses SpriteRenderer so the VR golden master (SwiftShader) renders faithfully.

let THREE;

const CENTER = new Vector3D(0, 0, 0);
const AXIS = new Vector3D(0, 0, 1); // swirl faces the camera

const createSprite = () => {
  const material = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(dot),
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    fog: true,
  });

  return new THREE.Sprite(material);
};

const createEmitter = () =>
  new Emitter()
    .setRate(new Rate(new Span(8, 12), new Span(0.01, 0.02)))
    .addInitializers([
      new Body(createSprite()),
      new Mass(1),
      new Life(2, 3),
      new Radius(8, 16),
      new Position(new SphereZone(200)),
    ])
    .addBehaviours([
      // Strong swirl, gentle pull → particles orbit several times as they fall
      // in, so the spiral reads (not just a churning cloud).
      new Vortex(CENTER, AXIS, 820, 70),
      new Color('#8a4dff', '#33ecff'), // violet → arcane cyan as it converges
      new Alpha(0.9, 0),
      new Scale(1.2, 0.2),
    ])
    .emit();

export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();

  camera.position.z = 500;

  return system
    .addEmitter(createEmitter())
    .addRenderer(new SpriteRenderer(scene, THREE));
};
