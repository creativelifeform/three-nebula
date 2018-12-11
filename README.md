# three-proton

[![Build Status](https://travis-ci.org/rohan-deshpande/three-proton.svg?branch=master)](https://travis-ci.org/rohan-deshpande/three-proton)
[![Coverage Status](https://coveralls.io/repos/github/rohan-deshpande/three-proton/badge.svg?branch=master)](https://coveralls.io/github/rohan-deshpande/three-proton?branch=master&kill_cache=1)

**Three Proton** is a magical, WebGL based 3D particle engine that has been designed to work in concert with [`three.js`](https://github.com/mrdoob/three.js). It is based on the [Proton](https://github.com/a-jie/Proton) particle engine library and shares much of its API.

Check out the examples and API reference documentation at [https://rohan-deshpande.github.io/three-proton/](https://rohan-deshpande.github.io/three-proton/)

## Features

- Four kinds of renderers
  - `MeshRenderer`
  - `SpriteRenderer`
  - `PointsRenderer`
  - `CustomRenderer`
- Three kinds of emitters which can simulate many different physical effects

  - `Emitter`
  - `BehaviourEmitter`
  - `FollowEmitter`

- Many kinds of particle behaviours and initializers
- Perfect compatibility with [`three@0.98.0`](https://github.com/mrdoob/three.js).

## Installation

### npm

```
npm i --save @rohandeshpande/three-proton
```

### script

```
<script type='text/javascript' src='node_modules/three-proton/build/three-proton.js'></script>
```

## Commands

- `build` - Builds the module and writes the code into `./build/three-proton.js`
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

## Usage

### Module

```javascript
import Proton, {
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
  Color
} from '@rohandeshpande/three-proton';
import * as THREE from 'three';

const proton = new Proton();
const emitter = new Emitter();
const renderer = new SpriteRenderer(threeScene);

// Set emitter rate (particles per second), particle initializers and behaviours
emitter
  .setRate(new Rate(new Span(4, 16), new Span(0.01)))
  .setInitializers([
    new Position(new PointZone(0, 0)),
    new Mass(1),
    new Radius(6, 12),
    new Life(3),
    new Velocity(45, new Vector3D(0, 1, 0), 180)
  ])
  .setBehaviours([
    new Alpha(1, 0),
    new Scale(0.1, 1.3),
    new Color(new THREE.Color(), new THREE.Color())
  ]);

// add the emitter and a renderer to proton
proton.addEmitter(emitter.emit()).addRenderer(renderer);
```

### Script

If you are adding `three-proton` to your project in the script tag, the only difference to the above example is how you access the classes you need. You can do that like so

```javascript
const { Proton, Emitter, Rate, Span } = window.Proton;
const proton = new Proton();
```

## License

[MIT](LICENSE.md)
