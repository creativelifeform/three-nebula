// Validity guard for the hand-authored `src/webgpu/public.d.ts` (the published
// `three-nebula/webgpu` types). Type-checked by `tsconfig.webgpu.json` — never
// executed.
//
// It deliberately does NOT import the real `src/webgpu/GPURenderer`: that module
// builds a TSL node graph whose types are too complex for the compiler and would
// re-introduce the multi-minute hang this whole approach exists to avoid. So this
// checks the declaration is well-formed and models real consumer usage
// (construct + hand off to the System + dispose). Runtime behaviour and the real
// class's shape are covered separately by test/webgpu/GPURenderer.spec.js.

import { GPURenderer } from '../../src/webgpu/public';
import type { GPURendererOptions } from '../../src/webgpu/public';
import System from '../../src/core/System';
import { Scene } from 'three';
import * as THREE_WEBGPU from 'three/webgpu';

const options: GPURendererOptions = { maxParticles: 100 };
const renderer = new GPURenderer(new Scene(), THREE_WEBGPU, options);

// Must type-check => the declaration extends BaseRenderer, so the System accepts it.
new System().addRenderer(renderer);

renderer.onSystemUpdate();
renderer.destroy();
