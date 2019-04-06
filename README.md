# Three Nebula

[![Build Status](https://travis-ci.org/creativelifeform/three-nebula.svg?branch=master)](https://travis-ci.org/creativelifeform/three-nebula)
[![Coverage Status](https://coveralls.io/repos/github/creativelifeform/three-nebula/badge.svg)](https://coveralls.io/github/creativelifeform/three-nebula?branch=master&kill_cache=1)

**Three Nebula** is a WebGL based 3D particle engine that has been designed to work alongside [`three.js`](https://github.com/mrdoob/three.js). Check out the [examples](https://creativelifeform.github.io/three-nebula/) and [API reference documentation](https://creativelifeform.github.io/three-nebula/api) for more.

## Features

- Perfect compatibility with [`three@0.98.0`](https://github.com/mrdoob/three.js)
- The ability to instantiate `three-nebula` particle systems from JSON objects using the static `System.fromJSON` method
- The ability to create particle systems from sprites as well as 3D meshes
- Many kinds of particle behaviours and initializers

## Installation

### npm

```
npm i --save three-nebula
```

### script

```
<script type='text/javascript' src='node_modules/three-nebula/build/three-nebula.js'></script>
```

## Usage

### Module

```javascript
import System, {
  Emitter,
  Rate,
  Span,
  Position,
  Mass,
  Radius,
  Life,
  Velocity,
  PointZone,
  Vector3D,
  Alpha,
  Scale,
  Color,
} from 'three-nebula';
import * as THREE from 'three';

const system = new System();
const emitter = new Emitter();
const renderer = new SpriteRenderer(threeScene);

// Set emitter rate (particles per second) as well as the particle initializers and behaviours
emitter
  .setRate(new Rate(new Span(4, 16), new Span(0.01)))
  .setInitializers([
    new Position(new PointZone(0, 0)),
    new Mass(1),
    new Radius(6, 12),
    new Life(3),
    new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
  ])
  .setBehaviours([
    new Alpha(1, 0),
    new Scale(0.1, 1.3),
    new Color(new THREE.Color(), new THREE.Color()),
  ])
  .emit();

// add the emitter and a renderer to your particle system
system.addEmitter(emitter).addRenderer(renderer);
```

You can also instantiate your system from a JSON object

```javascript
import System from 'three-nebula';

const json = {
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

const system = new System.fromJSON(json);
```

### Script Tag

If you are adding `three-nebula` to your project in the script tag, the only difference to the above example is how you access the classes you need. You can do that like so

```javascript
const { System, Emitter, Rate, Span } = window.System;
const system = new System();
```

## Development

### Scripts

There are a few NPM scripts in the root package.json:

- `build` - Builds the module and writes the code into `./build/three-nebula.js`
- `docs` - Serves the docs at http://localhost:8080
- `docs:build` - Copies the latest build to `./docs/js` and builds the API reference docs
- `test` - Runs all specs
- `test:only <spec>` - Runs a specific spec
- `test:watch` - Watches tests
- `test:watch-only <spec>` - Watches a specific spec
- `lint` - Lints code and circular dependencies in `./src`
- `coverage:generate` - Generates a code coverage report
- `coverage:view` - View the code coverage report
- `coverage:publish` - Publishes the coverage report
- `git:publish <commit-message>` - Builds the module, adds all changed files commits with the message you supply and pushes to remote

## License

[MIT](LICENSE.md)
