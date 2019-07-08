# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## `v5.0.0-alpha` - 2019-07-09 

### Added

* `docs-build` script which installs esdoc, builds the docs, then uninstalls it to get around the security vulns

### Changed

* Moved `three` to a peer/dev dependency
* Have copied core math classes which are absolutely needed internally, other dependencies are now passed in to functions/constructors as arguments
* Tests and examples all updated to be working
* Updated to webpack 4
* Updated to babel 7
* Bundle size is now **~103kb**

## `v4.0.4` - 2019-06-27

### Changed

- Emitters and behaviours will now ensure that non-nullable properties which can be either a number or infinite will default to `Infinity` if `null` is supplied eg., `life` & `totalEmitTimes`

### Added

- Tests covering this change

## `v4.0.4` - 2019-06-22

### Fixed

- Security vulnerabilities re: [`esdoc`](https://github.com/esdoc/esdoc/issues/542)

### Removed

- `esdoc`, `esdoc-standard-plugin`, `esdoc-ecmascript-proposal-plugin` dev deps

## `v4.0.3` - 2019-05-06

### Removed

- `jquery` and other unused dev dependencies

## `v4.0.2` - 2019-04-06

### Fixed

- Fixed README reference to wrong name

## `v4.0.1` - 2019-04-05

### Fixed

- Restored the `canUpdate` property and the improved `destroy` method which seem to have been lost in a PR revert/restore attempt gone wrong

## `v4.0.0` - 2019-04-05

### Changed

- Library name changed internally to `three-nebula`
- The `core/Proton` class is now `core/System`
- README, docs and source code all updated to reflect this change

## `v3.2.0` - 2019-03-29

### Added

- `canUpdate` property to the core particle system class

### Changed

- The `canUpdate` property is now checked within the `update` method to ensure safe updates
- `destroy` now toggles the `canUpdate` property internally to ensure that emitter updates are blocked while destroying to prevent errors occurring when destroying a system that is animating

## `v3.1.1` - 2019-03-27

### Fixed

- Security vulnerabilities in node modules

### Removed

- `istanbull-coveralls` dev dependency, it had security vulnerabilities

## `v3.1.0` - 2019-03-22

### Added

- `fromJSONAsync` method to `core/Proton` class for loading JSON systems asynchronously. This ensures all textures can be fully loaded before attempting to render the system.

### Fixed

- https://github.com/rohan-deshpande/three-proton/issues/38

## `v3.0.0` - 2019-03-01

### Added

- The `emitterBehaviours` array property to the `Emitter` class
- An API to facilitate interacting with this array
- An `updateEmitterBehaviours` method. This is called from within the main `update` method
- An example to show emitter behaviours working
- Tests covering new functionality

### Removed

- The `BehaviourEmitter` class. All functionality is now bundled into the `Emitter` class. This is a breaking change.

## `v2.3.0` - 2019-02-27

### Added

- The ability to set mesh material blending mode correctly from a string via the `fromJSON` method for the `BodySprite` initialiser
- Unit tests covering this

## `v2.2.0` - 2019-02-17

### Added

- `setRotation` method to `Emitter` class
- `rotation` prop extraction when building emitters via the `core/fromJSON` method
- `isEnabled` property to both initializers and behaviours
- `mutate` method to behaviours that perform internal logic
- Test coverage for new functionalities

### Changed

- The behaviour `applyBehaviour` method now checks to see if the behaviour is enabled or not before applying behaviour logic to the particle/emitter via a new `mutate` method

## `v2.1.0` - 2019-01-19

### Added

- `totalEmitTimes` and `life` JSON props for emitters

## `v2.0.0` - 2019-01-07

### Added

- `initializer/Velocity` module
- `VectorVelocity`, `PolarVelocity` and `RadialVelocity` classes to break up mixed argument types
- `math/ColorSpan` class, which is to be specifically used for spans of colors that can do randomisation
- Base `energize` method on the `Behaviour` abstract class. Sub classes now call this method in their `applyBehaviour` method rather than the parent's `applyBehaviour` method
- `core/fromJSON` which provides a way to create Proton instances from JSON
- `fromJSON` static method to the core Proton class and all supported initializers and behaviours
- An example to illustrate how to use the `fromJSON` static method
- `types.js` file to `initializer`, `behaviour`, `renderer` and `zone` modules which export class name types as constants
- Tests to cover the new `fromJSON` functionality

### Changed

- All examples which used deprecated methods/classes
- There is no longer a single `Velocity` initializer, this class is now the base class for the three kinds of velocity initializers provided
- `math/ArraySpan` no longer takes the string `'random'` as an argument to the constructor and will no longer be able to return random colors from `getValue`
- Tests updated
- Moved `initializer` and `behaviour` tests outside of `emitter` test module into the root of the `tests` module
- Pool now throws an error if it can neither instantiate or clone the object passed
- Particles and Emitters no longer have `p`, `v`, and `a`, props, rather, these are now explicitly spelled out as `position`, `velocity` and `acceleration`
- The same goes for the `old` cache object
- All examples have been updated
- The `math/Integration` class is now gone and has been replaced by `math/integration` functions

### Removed

- All deprecated methods and classes
- `initializer/Velocity.js`
- Unused args from Emitter `createParticle` and `setupParticle` methods

## `v1.0.13` - 2018-12-11

### Added

- Unit tests covering the `emitter/Emitter` class
- Better coverage for the `behaviour/Attraction` and `behaviour/Gravity` classes

## `v1.0.12` - 2018-12-06

### Added

- Unit tests covering the `core/Pool` class
- Doc blocks for this class

## `v1.0.11` - 2018-12-03

### Added

- Unit tests fully covering the `core/Proton` class

## `v1.0.10` - 2018-12-02

### Added

- Unit tests for the `core/Particle` class
- Doc blocks for this class

### Changed

- Refactored the `Particle.reset` method and constructor

## `v1.0.9` - 2018-12-02

### Changed

- The `initialize` module is now `initializer`
- All imports / exports / tests updated
- `Behaviour` constructor refactored to add default args. Also added more doc blocks

## `v1.0.8` - 2018-12-02

### Added

- Test coverage for all particle initializers

### Changed

- The base `Initialize` class is now `Initializer`, will change the `initialize` module to `initializer` when some re-architecting is done

## `v1.0.7` - 2018-12-01

## Added

- Unit tests for the behaviour module
- Integration with coveralls
- Some esdoc doc blocks

## `v1.0.6` - 2018-11-29

### Added

- `esdoc` dev dependency as well as configuration file
- Perfectly documented `Alpha` and `Attraction` behaviour classes
- `docs/api` directory
- `behaviours/constants.js` for defaults

### Changed

- `Alpha` behaviour now has `alphaA` and `alphaB` props rather than just `a` and `b`, unit tests updated accordingly

### Fixed

- There was a bug in the `Attraction` constructor that was causing `force` to be set to `NaN`, this has been fixed

## `v1.0.5` - 2018-11-28

### Fixed

- The `customrender` example is now working. The bug was caused by a mysterious error which I'm unsure about right now. It is related to geometry mutations or assignments... I'm not sure if it's being caused by `three` or this library right now. The issue was resolved in the `Debug` module by calling `geometry.clone()` from both the `drawZone` and `drawEmitter` methods. This also resolves the issues in the `meshrender-emitter` and `helloword` examples that were exhibiting the same behaviour

### Added

- A `NOTES.md` to keep track of notes on the codebase as understanding of it improves
- Some `esdoc` compatible doc blocks to some classes and methods. There's still a tonne of work to be done here.

## `v1.0.4` - 2018-11-26

### Fixed

- The `spriterender-pointzone` example is now working. The bug with this was caused by the `utils/ColorUtil` class's `getRGB` method

### Added

- `spriterender-ghost-ball` example

## `v1.0.3` - 2018-11-24

### Fixed

- `Gravity` class was overriding a parent method when this was unnecessary, this was breaking the behaviour
- The `helloworld` example's box meshes were being mutated by the debugger util somehow, I've commented that out for now

## `v1.0.2` - 2018-11-24

### Fixed

- Particle ids will no longer have NaNs in them
- The `Rotate` class' `applyBehaviour` method was passing `this` as the first argument to the `super` method which was breaking stuff
- `Gravity` was extending `Behaviour` instead of `Force`
- `Force` was calling its prototype in the constructor rather than just `this`
- `madge` is now a dev dependency rather than a dependency
- These have resolved issues with many of the examples, but some remain

### Changed

- `examples` is now `docs` so that GitHub pages can just use this directory

## `v1.0.1` - 2018-11-24

### Changed

- Package name to `@rohandeshpande/three-proton`

## `v1.0.0` - 2018-11-24

### Added

- `three`, `uuid` dependencies
- Scripts for serving examples locally and publishing to git easily
- `tests` directory with some basic regression tests
- `.travis.yml` for travis integration
- `webpack`, `eslint`, `madge`, `mocha`, `chai` as dev dependencies

### Changed

- Entire library ported to ES6
- Build command now uses Webpack

### Removed

- `lib` directory
