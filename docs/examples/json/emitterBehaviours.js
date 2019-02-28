// eslint-disable-next-line
const EMITTER_BEHAVIOURS_JSON = {
  preParticles: 500,
  integrationType: 'euler',
  emitters: [
    {
      rate: {
        particlesMin: 1,
        particlesMax: 5,
        perSecondMin: 0.01,
        perSecondMax: 0.02,
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      initializers: [
        {
          id: '19ed6321-399c-11e9-8047-93549ebdb1ae',
          type: 'Mass',
          properties: {
            min: 100,
            max: 1,
            isEnabled: true,
            center: true,
          },
        },
        {
          id: '19ed8a30-399c-11e9-8047-93549ebdb1ae',
          type: 'Life',
          properties: {
            min: 2,
            max: 4,
            isEnabled: true,
          },
        },
        {
          id: '19ed8a31-399c-11e9-8047-93549ebdb1ae',
          type: 'BodySprite',
          properties: {
            texture: './img/dot.png',
            isEnabled: true,
          },
        },
        {
          id: '19ed8a32-399c-11e9-8047-93549ebdb1ae',
          type: 'Radius',
          properties: {
            width: 20,
            height: 4,
            isEnabled: true,
          },
        },
        {
          id: '19ed8a33-399c-11e9-8047-93549ebdb1ae',
          type: 'RadialVelocity',
          properties: {
            radius: 40,
            x: 0,
            y: 1,
            z: 0,
            theta: 30,
            isEnabled: true,
          },
        },
      ],
      behaviours: [
        {
          id: '19ed8a34-399c-11e9-8047-93549ebdb1ae',
          type: 'Alpha',
          properties: {
            alphaA: 1,
            alphaB: 0.5,
            life: null,
            easing: 'easeLinear',
          },
        },
        {
          id: '19ed8a35-399c-11e9-8047-93549ebdb1ae',
          type: 'Color',
          properties: {
            colorA: '#092fbb',
            colorB: '#140a9a',
            life: null,
            easing: 'easeInQuad',
          },
        },
        {
          id: '19ed8a36-399c-11e9-8047-93549ebdb1ae',
          type: 'Scale',
          properties: {
            scaleA: 1,
            scaleB: 0.5,
            life: null,
            easing: 'easeLinear',
          },
        },
        {
          id: '19ed8a37-399c-11e9-8047-93549ebdb1ae',
          type: 'Force',
          properties: {
            fx: 0,
            fy: 1,
            fz: 0,
            life: null,
            easing: 'easeLinear',
          },
        },
        {
          id: '19ed8a38-399c-11e9-8047-93549ebdb1ae',
          type: 'Rotate',
          properties: {
            x: 1,
            y: 0,
            z: 0,
            life: null,
            easing: 'easeLinear',
          },
        },
        {
          id: '19ed8a39-399c-11e9-8047-93549ebdb1ae',
          type: 'RandomDrift',
          properties: {
            driftX: 1,
            driftY: 0,
            driftZ: 0,
            delay: 84,
            life: null,
            easing: 'easeLinear',
          },
        },
        {
          id: '19ed8a3a-399c-11e9-8047-93549ebdb1ae',
          type: 'Spring',
          properties: {
            x: 1,
            y: 10,
            z: 0,
            spring: 0.01,
            friction: 1,
            life: null,
            easing: 'easeInOutQuad',
          },
        },
      ],
      emitterBehaviours: [
        {
          id: '19ed8a38-399c-11e9-8047-93549ebdb1a0',
          type: 'Rotate',
          properties: {
            x: 1,
            y: 0,
            z: 0,
            life: null,
            easing: 'easeLinear',
          },
        },
      ],
    },
  ],
};
