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
  <a href="https://three-nebula-docs.netlify.app"><img src="https://api.netlify.com/api/v1/badges/1d2dda8a-cc12-487c-950d-ff69d95c7355/deploy-status"></a>
  <a href="https://threejs.org"><img src="https://img.shields.io/badge/three-v0.185.1-%230C7BB8"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
</p>

<hr/>

[CHANGELOG](https://github.com/creativelifeform/three-nebula/blob/master/CHANGELOG.md)

**Three Nebula** is a WebGL based 3D particle engine that has been designed to work alongside [`three.js`](https://github.com/mrdoob/three.js). Check out the [website](https://three-nebula.org/), [examples](https://three-nebula.org/examples), the [quickstart sandbox](https://codesandbox.io/s/three-nebula-quickstart-kz6uv) and [API reference documentation](https://three-nebula-docs.netlify.app/) for more.

## Features

- Built and tested against [`three@0.185.1`](https://github.com/mrdoob/three.js)
- The ability to instantiate `three-nebula` particle systems from JSON objects
- The ability to create particle systems from sprites as well as 3D meshes
- Many kinds of particle behaviours and initializers
- Optional WebGPU rendering via a batched `GPURenderer` at [`three-nebula/webgpu`](#webgpu)

## Installation

### npm

```
npm i --save three-nebula
```

### script

```
<script type='text/javascript' src='node_modules/three-nebula/dist/three-nebula.umd.js'></script>
```

## Usage

`three-nebula` ships ES module, CommonJS and UMD builds and declares [`three`](https://github.com/mrdoob/three.js) as a peer dependency, so install both alongside each other:

```
npm i --save three three-nebula
```

It works with any bundler (Vite, webpack, Rollup) or straight from a `<script>` tag — see the examples below. However you build a system, the one thing to remember is to **drive it from your render loop by calling `system.update()` once per frame**; nothing animates until you do. For runnable, self-contained examples of every renderer, see the [sandbox](#sandbox).

### Module

```javascript
import * as THREE from 'three';

import System, {
  SpriteRenderer,
  Emitter,
  Rate,
  Span,
  Position,
  Mass,
  Radius,
  Life,
  RadialVelocity,
  Vector3D,
  Alpha,
  Scale,
  Color,
  PointZone,
} from 'three-nebula';

const system = new System();
const renderer = new SpriteRenderer(threeScene, THREE);
const emitter = new Emitter();

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
    new Color(new THREE.Color(0xff0000), new THREE.Color(0x0000ff)),
  ])
  .emit();

// add the emitter and a renderer to your particle system
system
  .addRenderer(renderer)
  .addEmitter(emitter)
  .emit({
    onStart: () => {},
    onUpdate: () => {},
    onEnd: () => {},
  });

// drive the system from your render loop
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

System.fromJSONAsync(json, THREE).then(system => {
  console.log(system);
});
```

### WebGPU

`three-nebula` ships an optional batched `GPURenderer` for WebGPU at the `three-nebula/webgpu` entry point. It draws every particle as a camera-facing instanced quad in a single draw call and packs multiple textures into an atlas, and is a drop-in alternative to `SpriteRenderer` when your app renders with three's `WebGPURenderer`:

```javascript
import * as THREE from 'three/webgpu';
import System, { Emitter /* … initializers, behaviours … */ } from 'three-nebula';
import { GPURenderer } from 'three-nebula/webgpu';

const renderer = new THREE.WebGPURenderer();
await renderer.init();

const system = new System();
system.addRenderer(new GPURenderer(scene, THREE));
// build emitters as usual, then drive system.update() from your render loop
```

> **Requires a modern `three`.** The WebGPU entry point imports `three/webgpu` and `three/tsl`, which only exist in recent `three` releases (roughly r167+). This requirement applies **only** if you import `three-nebula/webgpu` — the core `three-nebula` package's supported `three` range is unchanged.

### Script Tag

If you are adding `three-nebula` to your project in the script tag, the only difference to the above example is how you access the classes you need. You can do that like so

```javascript
const { System, Emitter, Rate, Span } = window.Nebula;
const system = new System();
```

## Additive particles & transparent canvases

Additive blending adds light to whatever is already in the WebGL framebuffer. That works
perfectly on an **opaque** canvas — but a `THREE.WebGLRenderer` created with `{ alpha: true }`
(a transparent canvas over a DOM/CSS background) is a common gotcha, because WebGL can't
additively blend with the page behind the canvas — the canvas is composited **over** the page,
not added to it. Two rules keep additive particles looking right ([#133](https://github.com/creativelifeform/three-nebula/issues/133)):

1. **Over a transparent canvas, use textures that have an alpha channel.** The alpha is the
   coverage the browser needs to composite correctly. A fully-opaque, no-alpha,
   black-background additive texture will render as **opaque squares**, because its corners are
   opaque. (The classic three.js sprite textures such as `disc.png` all carry alpha.)

2. **For a flat colour or gradient background, let three own it — render it in the scene**
   (`scene.background`, or a backdrop mesh) on an **opaque** canvas, rather than a CSS
   background behind a transparent canvas. With the background in the framebuffer, additive
   blends against real pixels and works with **any** texture, no alpha channel required:

   ```javascript
   // gradient (or flat colour, image, …) as the scene background — opaque canvas
   scene.background = myGradientTexture;
   ```

   See the `Additive Blending — Scene Background` sandbox experiments (CPU + GPU) for a
   working example, and [#133](https://github.com/creativelifeform/three-nebula/issues/133)
   for the full rationale. (A future opt-in render-target compositing mode for true additive on
   a *transparent* canvas is specced in `specs/render-target-additive-compositing.md`.)

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

### Visual regression testing

The golden-master visual regression (VR) suite lives in `./vr`. It renders the library's example scenes — kept in `sandbox/examples/`, decoupled from the docs website — through a deterministic headless harness and diffs each screenshot against a committed baseline.

```
npm run vr           # render every example, check determinism (render twice, diff)
npm run vr:diff      # diff the latest render against the committed baselines
npm run vr:baseline  # (re)write the baselines in vr/baselines/
npm run vr:montage   # stitch the captures into one overview grid
```

Determinism comes from the harness, not luck: it seeds the global RNG, pins `requestAnimationFrame`, and captures a fixed number of frames, so a given example renders the same pixels every run. Baselines are compared with `pixelmatch`, and the image files are tracked with Git LFS.

**Why SwiftShader.** The captures run on headless Chromium with WebGL forced onto SwiftShader (Google's software rasteriser) via `--use-gl=angle --use-angle=swiftshader`. That's deliberate: the golden master is diffed near-pixel-exact and committed to the repo, and real GPUs don't produce identical pixels across machines. This is an OSS library — we can't pin the CI runner — so a hardware-rendered baseline would flake everywhere; SwiftShader renders bit-identical on any machine, which is what makes a committable baseline viable.

**The trade-off.** SwiftShader does not render the `GPURenderer`'s point sprites faithfully (they come out blocky regardless of the real output), so VR is trustworthy for the CPU-material renderers (`SpriteRenderer` / `MeshRenderer`) but **blind to `GPURenderer` visual correctness** — validate GPU changes in a real/headed browser plus unit tests. See [`vr/README.md`](vr/README.md) for the full rationale.

## License

[MIT](LICENSE.md)
