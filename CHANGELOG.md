# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2018-11-26

### Fixed

* The `spriterender-pointzone` example is now working. The bug with this was caused by the `utils/ColorUtil` class's `getRGB` method

### Added

* `spriterender-ghost-ball` example

## [1.0.3] - 2018-11-24

### Fixed

* `Gravity` class was overriding a parent method when this was unnecessary, this was breaking the behaviour
* The `helloworld` example's box meshes were being mutated by the debugger util somehow, I've commented that out for now

## [1.0.2] - 2018-11-24

### Fixed

* Particle ids will no longer have NaNs in them
* The `Rotate` class' `applyBehaviour` method was passing `this` as the first argument to the `super` method which was breaking stuff
* `Gravity` was extending `Behaviour` instead of `Force`
* `Force` was calling its prototype in the constructor rather than just `this`
* `madge` is now a dev dependency rather than a dependency
* These have resolved issues with many of the examples, but some remain

### Changed

* `examples` is now `docs` so that GitHub pages can just use this directory

## [1.0.1] - 2018-11-24

### Changed

* Package name to `@rohandeshpande/three-proton`

## [1.0.0] - 2018-11-24

### Added

* `three`, `uuid` dependencies
* Scripts for serving examples locally and publishing to git easily
* `tests` directory with some basic regression tests
* `.travis.yml` for travis integration
* `webpack`, `eslint`, `madge`, `mocha`, `chai` as dev dependencies

### Changed

* Entire library ported to ES6
* Build command now uses Webpack

### Removed

* `lib` directory
