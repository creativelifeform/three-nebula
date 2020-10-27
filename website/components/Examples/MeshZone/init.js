import ParticleSystem, {
  Body,
  Color,
  Emitter,
  Gravity,
  Life,
  Mass,
  MeshZone,
  Position,
  Radius,
  RandomDrift,
  Rate,
  Span,
  SpriteRenderer,
} from 'three-nebula';

import dot from '../../../assets/dot.png';

let GLTFLoader;
let THREE;

const createSprite = () => {
  const map = new THREE.TextureLoader().load(dot);
  const material = new THREE.SpriteMaterial({
    map: map,
    color: 0xff0000,
    blending: THREE.AdditiveBlending,
    fog: true,
  });

  return new THREE.Sprite(material);
};

const loadMeshFromGLTF = () =>
  new Promise((resolve, reject) =>
    new GLTFLoader().load('/sword.glb', ({ scene }) =>
      scene.traverse(child => child.isMesh && resolve(child))
    )
  );

const createEmitter = async mesh => {
  const emitter = new Emitter();

  return emitter
    .setRate(new Rate(new Span(11, 15), new Span(0.02)))
    .addInitializers([
      new Position(new MeshZone(mesh, 200, THREE.Geometry)),
      new Mass(1),
      new Radius(1, 3),
      new Life(1.5),
      new Body(createSprite()),
    ])
    .addBehaviours([
      new RandomDrift(2, 2, 2),
      new Gravity(0),
      new Color(['#00aeff', '#0fa954', '#54396e', '#e61d5f']),
      new Color('random'),
    ])
    .setPosition({ x: 0, y: 0 })
    .emit();
};

export default async (three, { scene, camera }) => {
  THREE = three;
  GLTFLoader = await import('three-gltf-loader');

  const system = new ParticleSystem();
  const mesh = await loadMeshFromGLTF();
  const emitter = await createEmitter(mesh);

  mesh.material.wireframe = true;
  scene.add(mesh);

  return system
    .addEmitter(emitter)
    .addRenderer(new SpriteRenderer(scene, THREE));
};
