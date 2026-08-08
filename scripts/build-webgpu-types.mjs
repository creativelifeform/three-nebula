// Publishes the `three-nebula/webgpu` type declaration.
//
// The real `src/webgpu/GPURenderer/index.ts` can't go through `tsc` declaration
// emit: its TSL node graph produces types too complex for the compiler to
// serialize (it hangs, then gets killed before emitting anything). Instead we
// hand-maintain the small public surface in `src/webgpu/public.d.ts` and copy
// it verbatim to where package.json's `./webgpu` export points its `types`.
// Its relative imports are depth-consistent between the two locations, so no
// rewriting is required. `tsconfig.webgpu.json` checks the declaration is valid
// and models real usage (it can't diff against the TSL-heavy real class, which
// hangs tsc); the runtime spec exercises the public members.

import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src/webgpu/public.d.ts');
const outDir = resolve(root, 'dist/types/webgpu');
const out = resolve(outDir, 'index.d.ts');

mkdirSync(outDir, { recursive: true });
copyFileSync(src, out);

console.log(`webgpu types: ${src} -> ${out}`);
