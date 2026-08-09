import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

// A thin static server for the sandbox. The experiments are plain ES modules
// that import `three`, `three/addons/*` and `three-nebula` by name — Vite
// resolves them from node_modules. `three-nebula` is aliased to the library
// source, so editing the library hot-reloads the sandbox with no build step.
export default defineConfig({
  root: resolve(root, 'sandbox'),
  resolve: {
    alias: [
      // More specific first: the /webgpu subpath maps to its own entry.
      {
        find: /^three-nebula\/webgpu$/,
        replacement: resolve(root, 'src/webgpu/index.ts'),
      },
      { find: /^three-nebula$/, replacement: resolve(root, 'src/index.ts') },
    ],
  },
  server: { port: 5000, open: true },
});
