// Particle system for the #133 repro: a slow radial spray of large, additive,
// no-alpha sprites (circle_01.png). `BodySprite` defaults its material blending
// to AdditiveBlending (DEFAULT_JSON_MATERIAL_PROPERTIES), so no explicit
// materialProperties are needed — this is the standard additive-particle setup.
export const SYSTEM = {
  particleSystemState: {
    preParticles: 300,
    integrationType: 'EULER',
    emitters: [
      {
        id: 'repro-133-emitter',
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
          {
            id: 'i-mass',
            type: 'Mass',
            properties: { min: 1, max: 1, isEnabled: true },
          },
          {
            id: 'i-life',
            type: 'Life',
            properties: { min: 3, max: 4, isEnabled: true },
          },
          {
            id: 'i-body',
            type: 'BodySprite',
            properties: {
              texture: '/assets/circle_01.png',
              isEnabled: true,
            },
          },
          {
            id: 'i-radius',
            type: 'Radius',
            properties: { width: 30, height: 20, isEnabled: true },
          },
          {
            id: 'i-velocity',
            type: 'RadialVelocity',
            properties: { radius: 10, x: 0, y: 1, z: 0, theta: 180, isEnabled: true },
          },
        ],
        behaviours: [
          {
            id: 'b-alpha',
            type: 'Alpha',
            properties: { alphaA: 1, alphaB: 0.4, life: null, easing: 'easeLinear' },
          },
          {
            id: 'b-color',
            type: 'Color',
            properties: {
              colorA: '#ffcc33',
              colorB: '#ff3300',
              life: null,
              easing: 'easeOutCubic',
            },
          },
          {
            id: 'b-scale',
            type: 'Scale',
            properties: { scaleA: 1, scaleB: 1.6, life: null, easing: 'easeLinear' },
          },
        ],
        emitterBehaviours: [],
      },
    ],
  },
};
