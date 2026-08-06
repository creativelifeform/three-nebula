import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = dirname(fileURLToPath(import.meta.url));

// Separate build for the `three-nebula/webgpu` entry. Kept apart from the core
// build so node-material / TSL code (three/webgpu, three/tsl) never leaks into
// the core WebGL bundle. `emptyOutDir: false` preserves the core build's dist
// output (this runs after `vite build`). No UMD — WebGPU is ESM/CJS only.
export default defineConfig({
  build: {
    target: 'es2020',
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(root, 'src/webgpu/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format =>
        format === 'es' ? 'three-nebula-webgpu.mjs' : 'three-nebula-webgpu.cjs',
    },
    rollupOptions: {
      external: ['three', 'three/webgpu', 'three/tsl'],
    },
  },
});
