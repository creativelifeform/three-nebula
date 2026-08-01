// Compatibility shim for the handful of `three` classes and constants the core
// simulation math uses internally (`Vector3D extends Vector3`, `Euler`, and the
// material blending modes).
//
// This module used to vendor a snapshot of these from three r106 to avoid
// bundling three. That's no longer necessary: `three` is a peer dependency and
// is externalised by the build (see vite.config.js `rollupOptions.external`), so
// importing it here does not add it to the bundle. Re-exporting the real classes
// gives one source of truth, correct types, and keeps the library in step with
// the three version the consumer actually runs.
export { Euler, Vector3 } from 'three';
export {
  AdditiveBlending,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
} from 'three';
