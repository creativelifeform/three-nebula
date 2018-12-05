# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.0.11] - 2018-12-06

### Added

- Unit tests covering the `core/Pool` class
- Doc blocks for this class

## [1.0.11] - 2018-12-03

### Added

- Unit tests fully covering the `core/Proton` class

## [1.0.10] - 2018-12-02

### Added

- Unit tests for the `core/Particle` class
- Doc blocks for this class

### Changed

- Refactored the `Particle.reset` method and constructor

## [1.0.9] - 2018-12-02

### Changed

- The `initialize` module is now `initializer`
- All imports / exports / tests updated
- `Behaviour` constructor refactored to add default args. Also added more doc blocks

## [1.0.8] - 2018-12-02

### Added

- Test coverage for all particle initializers

### Changed

- The base `Initialize` class is now `Initializer`, will change the `initialize` module to `initializer` when some re-architecting is done

## [1.0.7] - 2018-12-01

## Added

- Unit tests for the behaviour module
- Integration with coveralls
- Some esdoc doc blocks

## [1.0.6] - 2018-11-29

### Added

- `esdoc` dev dependency as well as configuration file
- Perfectly documented `Alpha` and `Attraction` behaviour classes
- `docs/api` directory
- `behaviours/constants.js` for defaults

### Changed

- `Alpha` behaviour now has `alphaA` and `alphaB` props rather than just `a` and `b`, unit tests updated accordingly

### Fixed

- There was a bug in the `Attraction` constructor that was causing `force` to be set to `NaN`, this has been fixed

## [1.0.5] - 2018-11-28

### Fixed

- The `customrender` example is now working. The bug was caused by a mysterious error which I'm unsure about right now. It is related to geometry mutations or assignments... I'm not sure if it's being caused by `three` or this library right now. The issue was resolved in the `Debug` module by calling `geometry.clone()` from both the `drawZone` and `drawEmitter` methods. This also resolves the issues in the `meshrender-emitter` and `helloword` examples that were exhibiting the same behaviour

### Added

- A `NOTES.md` to keep track of notes on the codebase as understanding of it improves
- Some `esdoc` compatible doc blocks to some classes and methods. There's still a tonne of work to be done here.

## [1.0.4] - 2018-11-26

### Fixed

- The `spriterender-pointzone` example is now working. The bug with this was caused by the `utils/ColorUtil` class's `getRGB` method

### Added

- `spriterender-ghost-ball` example

## [1.0.3] - 2018-11-24

### Fixed

- `Gravity` class was overriding a parent method when this was unnecessary, this was breaking the behaviour
- The `helloworld` example's box meshes were being mutated by the debugger util somehow, I've commented that out for now

## [1.0.2] - 2018-11-24

### Fixed

- Particle ids will no longer have NaNs in them
- The `Rotate` class' `applyBehaviour` method was passing `this` as the first argument to the `super` method which was breaking stuff
- `Gravity` was extending `Behaviour` instead of `Force`
- `Force` was calling its prototype in the constructor rather than just `this`
- `madge` is now a dev dependency rather than a dependency
- These have resolved issues with many of the examples, but some remain

### Changed

- `examples` is now `docs` so that GitHub pages can just use this directory

## [1.0.1] - 2018-11-24

### Changed

- Package name to `@rohandeshpande/three-proton`

## [1.0.0] - 2018-11-24

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
