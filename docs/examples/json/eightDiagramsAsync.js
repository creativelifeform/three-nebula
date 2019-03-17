// eslint-disable-next-line
const EIGHT_DIAGRAMS_JSON = {
  preParticles: 500,
  integrationType: 'euler',
  emitters: [
    {
      rate: {
        particlesMin: 5,
        particlesMax: 7,
        perSecondMin: 0.01,
        perSecondMax: 0.02,
      },
      position: {
        x: 70,
        y: 0,
      },
      initializers: [
        {
          type: 'Mass',
          properties: {
            min: 1,
            max: 1,
          },
        },
        {
          type: 'Life',
          properties: {
            min: 2,
            max: 2,
          },
        },
        {
          type: 'BodySprite',
          properties: {
            texture: './img/dot.png',
          },
        },
        {
          type: 'Radius',
          properties: {
            width: 80,
            height: 80,
          },
        },
        {
          type: 'RadialVelocity',
          properties: {
            radius: 200,
            x: 0,
            y: 0,
            z: -1,
            theta: 0,
          },
        },
      ],
      behaviours: [
        {
          type: 'Alpha',
          properties: {
            alphaA: 1,
            alphaB: 0,
          },
        },
        {
          type: 'Color',
          properties: {
            colorA: '#4F1500',
            colorB: '#0029FF',
          },
        },
        {
          type: 'Scale',
          properties: {
            scaleA: 1,
            scaleB: 0.5,
          },
        },
        {
          type: 'Force',
          properties: {
            fx: 0,
            fy: 0,
            fz: -20,
          },
        },
      ],
    },
    {
      rate: {
        particlesMin: 5,
        particlesMax: 7,
        perSecondMin: 0.01,
        perSecondMax: 0.02,
      },
      position: {
        x: -70,
        y: 0,
      },
      initializers: [
        {
          type: 'Mass',
          properties: {
            min: 1,
            max: 1,
          },
        },
        {
          type: 'Life',
          properties: {
            min: 2,
            max: 2,
          },
        },
        {
          type: 'BodySprite',
          properties: {
            texture: './img/dot.png',
          },
        },
        {
          type: 'Radius',
          properties: {
            width: 80,
            height: 80,
          },
        },
        {
          type: 'RadialVelocity',
          properties: {
            radius: 200,
            x: 0,
            y: 0,
            z: -1,
            theta: 0,
          },
        },
      ],
      behaviours: [
        {
          type: 'Alpha',
          properties: {
            alphaA: 1,
            alphaB: 0,
          },
        },
        {
          type: 'Color',
          properties: {
            colorA: '#004CFE',
            colorB: '#6600FF',
          },
        },
        {
          type: 'Scale',
          properties: {
            scaleA: 1,
            scaleB: 0.5,
          },
        },
        {
          type: 'Force',
          properties: {
            fx: 0,
            fy: 0,
            fz: -20,
          },
        },
      ],
    },
  ],
};
