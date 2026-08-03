// Shared builder for the #133 additive-over-scene-background VR cases.
//
// The gradient is a scene object (opaque backdrop), so additive particles blend
// against real framebuffer pixels — the recommended approach from the #133
// resolution (see specs/fix-133-additive-transparent-canvas.md). Uses the
// opaque, no-alpha circle_01.png on purpose: the whole point is that it renders
// correctly here without an alpha channel.
import System from 'three-nebula';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import suzanneUrl from '../../assets/Suzanne.glb?url';
import circleUrl from '../../assets/circle_01.png?url';

const makeGradientBackground = THREE => {
  const canvas = document.createElement('canvas');

  canvas.width = 4;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);

  gradient.addColorStop(0, '#f6d365');
  gradient.addColorStop(0.45, '#fda085');
  gradient.addColorStop(1, '#a18cd1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

// Inline so the case is self-contained (no coupling to the sandbox data.js).
const systemJSON = {
  preParticles: 300,
  integrationType: 'EULER',
  emitters: [
    {
      id: 'vr-additive-scene-background',
      totalEmitTimes: null,
      life: null,
      rate: {
        particlesMin: 1,
        particlesMax: 1,
        perSecondMin: 0.15,
        perSecondMax: 0.2,
      },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      initializers: [
        { id: 'm', type: 'Mass', properties: { min: 1, max: 1, isEnabled: true } },
        { id: 'l', type: 'Life', properties: { min: 3, max: 4, isEnabled: true } },
        {
          id: 'b',
          type: 'BodySprite',
          properties: { texture: circleUrl, isEnabled: true },
        },
        {
          id: 'r',
          type: 'Radius',
          properties: { width: 30, height: 20, isEnabled: true },
        },
        {
          id: 'v',
          type: 'RadialVelocity',
          properties: { radius: 10, x: 0, y: 1, z: 0, theta: 180, isEnabled: true },
        },
      ],
      behaviours: [
        {
          id: 'a',
          type: 'Alpha',
          properties: { alphaA: 1, alphaB: 0.4, life: null, easing: 'easeLinear' },
        },
        {
          id: 'c',
          type: 'Color',
          properties: {
            colorA: '#ffcc33',
            colorB: '#ff3300',
            life: null,
            easing: 'easeOutCubic',
          },
        },
        {
          id: 's',
          type: 'Scale',
          properties: { scaleA: 1, scaleB: 1.6, life: null, easing: 'easeLinear' },
        },
      ],
      emitterBehaviours: [],
    },
  ],
};

export const buildAdditiveSceneBackground = async (THREE, { scene }, Renderer) => {
  scene.background = makeGradientBackground(THREE);

  // Awaited so Suzanne is in the scene before the deterministic frame loop.
  const gltf = await new GLTFLoader().loadAsync(suzanneUrl);
  const suzanne = gltf.scene;

  suzanne.scale.setScalar(12);
  suzanne.position.set(0, 0, 0);
  suzanne.rotation.y = -0.5;
  scene.add(suzanne);

  const system = await System.fromJSONAsync(systemJSON, THREE);

  return system.addRenderer(new Renderer(scene, THREE));
};
