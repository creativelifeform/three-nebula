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
    alias: {
      'three-nebula': resolve(root, 'src/index.js'),
    },
  },
  server: { port: 5000, open: true },
});
