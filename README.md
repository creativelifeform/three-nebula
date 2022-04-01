<p align="center">
  <a href="https://three-nebula.org/">
    <img alt="react-router" src="https://three-nebula.org/favicon/nebula-logo-favicon-master.svg" width="100">
  </a>
</p>

<h3 align="center">&nbsp;&nbsp;&nbsp;&nbsp;three-nebula</h3>

<p align="center">
  &nbsp;&nbsp;&nbsp;&nbsp;WebGL based 3D particle system engine for <a href="https://threejs.org">three</a>
</p>

<p align="center">
&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/creativelifeform/three-nebula/actions?query=workflow%3Aci"><img src="https://github.com/creativelifeform/three-nebula/workflows/ci/badge.svg"></a>
  <a href="https://coveralls.io/github/creativelifeform/three-nebula?branch=master&kill_cache=1"><img src="https://coveralls.io/repos/github/creativelifeform/three-nebula/badge.svg"></a>
  <a href="https://threejs.org"><img src="https://img.shields.io/badge/three-v0.122.0-%230C7BB8"></a>
  <a href="https://spectrum.chat/nebula"><img src="https://img.shields.io/badge/spectrum-chat-%237816F9"></a>
</p>

<hr/>

[CHANGELOG](https://github.com/creativelifeform/three-nebula/blob/master/CHANGELOG.md)

**Three Nebula** is a WebGL based 3D particle engine that has been designed to work alongside [`three.js`](https://github.com/mrdoob/three.js). Check out the [website](https://three-nebula.org/), [examples](https://three-nebula.org/examples), the [quickstart sandbox](https://codesandbox.io/s/three-nebula-quickstart-kz6uv) and [API reference documentation](https://three-nebula-docs.netlify.com/) for more.

## Features

- Perfect compatibility with [`three@0.122.0`](https://github.com/mrdoob/three.js)
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
import * as THREE from 'three';

import System, {
  SpriteRenderer,
  Emitter,
  Rate,
  RadialVelocity,
  Life,
  Vector3D,
  Alpha,
  Scale,
  Color,
} from 'three-nebula';

const system = new System();
const renderer = new SpriteRenderer(threeScene, THREE);
const emitter = new Emitter();

emitter
  .setRate(new Rate(1, 0.1))
  .setInitializers([
    new RadialVelocity(1, new Vector3D(0, 1, 0), 180),
    new Life(3),
  ])
  .setBehaviours([
    new Alpha(1, 0),
    new Scale(0.25, 0.125),
    new Color(new THREE.Color(0xFF0000), new THREE.Color(0x0000FF)),
  ])
  .emit();

system
  .addRenderer(renderer)
  .addEmitter(emitter)
  .emit({
    onStart: () => { },
    onUpdate: () => { },
    onEnd: () => { },
  });

const animate = () => {
  system.update();
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
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
const { System, Emitter, Rate, Span } = window.Nebula;
const system = new System();
```

## Development

### Sandbox

The sandbox located in `./sandbox` contains a kind of plain JavaScript bootstrapping framework for testing and experimenting with library changes. The experiments in here are not permanent and will get updated/added/removed from time to time.

Because of the visual and graphical nature of the library it is sometimes very helpful to have simple barebones examples that allow you to dig into the root cause of an issue or try new things out.

The sandbox can easily be run via

```
npm run sandbox
```

This will serve the sandbox at `http://localhost:5000` and you can checkout the various experiments in the browser. It will also auto rebuild the library code and push the rebuilt bundle to the sandbox so all you need to do in order to see your changes is to refresh the browser.

## License

[MIT](LICENSE.md)
