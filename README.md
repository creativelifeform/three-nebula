<p align="center">
  <a href="https://dev.three-nebula.org/">
    <img alt="react-router" src="https://dev.three-nebula.org/favicon/nebula-logo-favicon-master.svg" width="100">
  </a>
</p>

<h3 align="center">&nbsp;&nbsp;&nbsp;&nbsp;three-nebula</h3>

<p align="center">
  &nbsp;&nbsp;&nbsp;&nbsp;WebGL based 3D particle system engine for <a href="https://threejs.org">three</a>
</p>

<p align="center">
&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://travis-ci.org/creativelifeform/three-nebula"><img src="https://travis-ci.org/creativelifeform/three-nebula.svg?branch=master"></a>
  <a href="https://coveralls.io/github/creativelifeform/three-nebula?branch=master&kill_cache=1"><img src="https://coveralls.io/repos/github/creativelifeform/three-nebula/badge.svg"></a>
  <a href="https://threejs.org">
  <img src="https://img.shields.io/badge/three-v0.112.0-%230C7BB8">
  </a>
</p>

<hr/>

[CHANGELOG](https://github.com/creativelifeform/three-nebula/blob/master/CHANGELOG.md)

**Three Nebula** is a WebGL based 3D particle engine that has been designed to work alongside [`three.js`](https://github.com/mrdoob/three.js). Check out the [website](https://dev.three-nebula.org/), [examples](https://dev.three-nebula.org/examples) and [API reference documentation](https://three-nebula-docs.netlify.com/) for more.

## Features

- Perfect compatibility with [`three@0.112.0`](https://github.com/mrdoob/three.js)
- The ability to instantiate `three-nebula` particle systems from JSON objects
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
const renderer = new SpriteRenderer(threeScene, THREE);

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
  ]);

// add the emitter and a renderer to your particle system
system
  .addEmitter(emitter)
  .addRenderer(renderer)
  .emit({ onStart, onUpdate, onEnd });
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

new System.fromJSONAsync(json, THREE).then(system => {
  console.log(system);
});
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
