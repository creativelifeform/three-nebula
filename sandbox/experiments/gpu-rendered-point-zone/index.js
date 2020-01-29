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
  GPURenderer,
  Vector3D,
  Position,
  PointZone,
} = window.Nebula;

const ParticleSystem = window.Nebula.default;

let hcolor = 0;
let tha = 0;
let ctha = 0;

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
    .setRate(new Rate(new Span(4, 16), new Span(0.01)))
    .addInitializers([
      new Position(new PointZone(0, 0)),
      new Mass(1),
      new Radius(6, 12),
      new Life(3),
      // new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
    ])
    .addBehaviours([
      new Alpha(1, 0),
      new Scale(0.3, 0.6),
      new Color(color1, color2),
    ])
    .emit();
};

window.init = async ({ scene, camera, renderer }) => {
  const system = new ParticleSystem();
  const color1 = new THREE.Color();
  const color2 = new THREE.Color();
  const emitter = createEmitter(color1, color2);
  // const systemRenderer = new SpriteRenderer(scene, THREE);
  const systemRenderer = new GPURenderer(scene, THREE);

  console.log(systemRenderer);

  renderer.setClearColor('red');

  // animate({ color1, color2, emitter, camera, scene });

  return system.addEmitter(emitter).addRenderer(systemRenderer);
};
