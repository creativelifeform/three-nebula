window.SYSTEM = {
  headerState: {
    projectName: 'data',
    version: { loading: false, error: null, data: null },
    release: { loading: false, error: null, data: null },
    shouldShowReleaseDownloadDialog: false,
  },
  particleSystemState: {
    preParticles: 500,
    integrationType: 'EULER',
    emitters: [
      {
        id: '51ca9450-3d8b-11e9-a1e8-4785d9606b75',
        totalEmitTimes: null,
        life: null,
        cache: { totalEmitTimes: 2, life: 0.5 },
        rate: {
          particlesMin: 1,
          particlesMax: 4,
          perSecondMin: 0.01,
          perSecondMax: 0.02,
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        initializers: [
          {
            id: '51ca9451-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Mass',
            properties: { min: 30, max: 10, isEnabled: true },
          },
          {
            id: '51ca9452-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Life',
            properties: { min: 2, max: 4, isEnabled: true },
          },
          {
            id: '51ca9453-3d8b-11e9-a1e8-4785d9606b75',
            type: 'BodySprite',
            properties: {
              texture:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJkSURBVHjaxJeJbusgEEW94S1L//83X18M2MSuLd2pbqc4wZGqRLrKBsyZhQHny7Jk73xVL8xpVhWrcmiB5lX+6GJ5YgQ2owbAm8oIwH1VgKZUmGcRqKGGPgtEQQAzGR8hQ59fAmhJHSAagigJ4E7GPWRXOYC6owAd1JM6wDQPADyMWUqZRMqmAojHp1Vn6EQQEgUNMJLnUjMyJsM49wygBkAPw9dVFwXRkncCIIW3GRgoTQUZn6HxCMAFEFd8TwEQ78X4rHbILoAUmeT+RFG4UhQ6MiIAE4W/UsYFjuVjAIa2nIY4q1R0GFtQWG3E84lqw2GO2QOoCKBVu0BAPgDSU0eUDjjQenNkV/AW/pWChhpMTelo1a64AOKM30vk18GzTHXCNtI/Knz3DFBgsUqBGIjTInXRY1yA9xkVoqW5tVq3pDR9A0hfF5BSARmVnh7RMDCaIdcNgbPBkgzn1Bu+SfIEFSpSBmkxyrMicb0fAEuCZrWnN89veA/4XcakrPcjBWzkTuLjlbfTQPOlBhz+HwkqqPXmPQDdrQItxE1moGof1S74j/8txk8EHhTQrAE8qlwfqS5yukm1x/rAJ9Jiaa6nyATqD78aUVBhFo8b1V4DdTXdCW+IxA1zB4JhiOhZMEWO1HqnvdoHZ4FAMIhV9REF8FiUm0jsYPEJx/Fm/N8OhH90HI9YRHesWbXXZwAShU8qThe7H8YAuJmw5yOd989uRINKRTJAhoF8jbqrHKfeCYdIISZfSq26bk/K+yO3YvfKrVgiwQBHnwt8ynPB25+M8hceTt/ybPhnryJ78+tLgAEAuCFyiQgQB30AAAAASUVORK5CYII=',
              isEnabled: true,
            },
          },
          {
            id: '51ca9454-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Radius',
            properties: { width: 12, height: 4, isEnabled: true },
          },
          {
            id: '51ca9455-3d8b-11e9-a1e8-4785d9606b75',
            type: 'RadialVelocity',
            properties: {
              radius: 10,
              x: 0,
              y: 5,
              z: 0,
              theta: 900,
              isEnabled: true,
            },
          },
        ],
        behaviours: [
          {
            id: '51ca9456-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Alpha',
            properties: {
              alphaA: 1,
              alphaB: 0,
              life: null,
              easing: 'easeLinear',
            },
          },
          {
            id: '51ca9457-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Color',
            properties: {
              colorA: '#002a4f',
              colorB: '#0029FF',
              life: null,
              easing: 'easeOutCubic',
            },
          },
          {
            id: '51ca9458-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Scale',
            properties: {
              scaleA: 1,
              scaleB: 0.5,
              life: null,
              easing: 'easeLinear',
            },
          },
          {
            id: '51ca9459-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Force',
            properties: {
              fx: 0,
              fy: 5,
              fz: 0,
              life: null,
              easing: 'easeLinear',
            },
          },
          {
            id: '51ca945a-3d8b-11e9-a1e8-4785d9606b75',
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
            id: '51ca945b-3d8b-11e9-a1e8-4785d9606b75',
            type: 'RandomDrift',
            properties: {
              driftX: 1,
              driftY: 23,
              driftZ: 4,
              delay: 1,
              life: null,
              easing: 'easeLinear',
            },
          },
          {
            id: '51ca945c-3d8b-11e9-a1e8-4785d9606b75',
            type: 'Spring',
            properties: {
              x: 1,
              y: 5,
              z: 0,
              spring: 0.01,
              friction: 1,
              life: null,
              easing: 'easeLinear',
            },
          },
        ],
        emitterBehaviours: [],
      },
    ],
  },
};
