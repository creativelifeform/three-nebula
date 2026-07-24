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

`three-nebula` ships ES module, CommonJS and UMD builds and declares [`three`](https://github.com/mrdoob/three.js) as a peer dependency, so install both alongside each other:

```
npm i --save three three-nebula
```

It works with any bundler (Vite, webpack, Rollup) or straight from a `<script>` tag — see the examples below. However you build a system, the one thing to remember is to **drive it from your render loop by calling `system.update()` once per frame**; nothing animates until you do. For runnable, self-contained examples of every renderer, see the [sandbox](#sandbox).

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
const { System, Emitter, Rate, Span } = window.Nebula;
const system = new System();
```

## Development

### Sandbox

The sandbox in `./sandbox` is a small collection of visual experiments for testing and playing with library changes — the kind of barebones examples that make it easy to dig into a rendering issue or try something new. The experiments aren't permanent; they get added and removed over time.

Run it with

```
npm run sandbox
```

This serves the sandbox with Vite (defaults to `http://localhost:5000`, falling back to the next free port). Pick an experiment from the index page.

Each experiment is a small ES module — there's no build config to think about. Vite resolves `three`, `three/addons/*` and `three-nebula` by name, and `three-nebula` is aliased to the library **source**, so editing the library hot-reloads the sandbox with no separate build step.

Adding an experiment is just two files under `sandbox/experiments/<name>/`.

`index.html` — the shared styles, a canvas inside an `#app` container (the harness mounts its FPS panel there and the styles size the canvas), and a module entry point:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="/style/reset.css" />
    <link rel="stylesheet" href="/style/app.css" />
  </head>
  <body>
    <div id="app">
      <canvas id="canvas"></canvas>
    </div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
```

`index.js` — build a system and hand it to `run`:

```javascript
import * as THREE from 'three';
import System, { Emitter, SpriteRenderer /* … */ } from 'three-nebula';
import { run } from '/common/run.js';

const init = async ({ scene, camera, renderer }) => {
  const system = new System();
  // … set up emitters, initializers and behaviours …
  return system.addRenderer(new SpriteRenderer(scene, THREE));
};

run(init);
```

`run` (in `sandbox/common/`) sets up the scene, camera, renderer and animation loop, calls your `init` with `{ scene, camera, renderer }`, and drives `system.update()` every frame — so an experiment only has to describe the system it wants to see.

## License

[MIT](LICENSE.md)
