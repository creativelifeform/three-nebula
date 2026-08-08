// Hand-authored public declaration for the `three-nebula/webgpu` entry.
//
// Why hand-authored: `GPURenderer`'s implementation builds a TSL node graph
// (`three/tsl`), whose generated types are so large that `tsc`'s declaration
// emit for the real `index.ts` blows past the "union type too complex to
// represent" ceiling and effectively hangs (>4 min, killed before emit). The
// public surface, however, is small and stable — none of it is TSL — so we
// describe it here and the build copies this file verbatim to
// `dist/types/webgpu/index.d.ts` (see scripts/build-webgpu-types.mjs).
//
// The relative imports below resolve identically from `src/webgpu/` and from
// the copied location `dist/types/webgpu/` (same depth to their siblings), so
// no rewriting is needed on copy.
//
// Guarding: `tsconfig.webgpu.json` checks this file is valid and compiles a
// real usage sample (construct -> System.addRenderer -> dispose). It does NOT
// diff against the real class — resolving that class's type forces tsc to
// evaluate the TSL graph, which hangs (the very reason we hand-author here).
// Fidelity of the public members is exercised at runtime by
// test/webgpu/GPURenderer.spec.js. When you change a public member on the real
// GPURenderer, update this file too.

import type { InstancedBufferGeometry, Object3D } from 'three';
import type { Mesh, SpriteNodeMaterial } from 'three/webgpu';
import type Particle from '../core/Particle';
import BaseRenderer from '../renderer/BaseRenderer';

export interface GPURendererOptions {
  /** Upper bound on simultaneously-live particles (instance buffer size). */
  maxParticles?: number;
}

/**
 * WebGPU batched particle renderer — the node/TSL counterpart of the GLSL
 * `GPURenderer`. Draws every particle as a camera-facing instanced quad
 * (`SpriteNodeMaterial`) in a single call. Requires the host to render with
 * three's `WebGPURenderer`; pass the `three/webgpu` namespace as `three`.
 */
export declare class GPURenderer extends BaseRenderer {
  constructor(
    container: Object3D,
    three: typeof import('three/webgpu'),
    options?: GPURendererOptions
  );

  three: typeof import('three/webgpu');
  container: Object3D;
  maxParticles: number;

  mesh: Mesh;
  material: SpriteNodeMaterial;
  geometry: InstancedBufferGeometry;

  /** Rewires the atlas texture + index into the colour node after a rebuild. */
  buildColorNode(): void;

  onParticleCreated(particle: Particle): void;
  onParticleUpdate(particle: Particle): void;
  onParticleDead(particle: Particle): void;
  onSystemUpdate(): void;

  destroy(): void;
}
