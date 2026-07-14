import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = dirname(fileURLToPath(import.meta.url));

// Library build (replaces the old webpack UMD + `babel src` cjs/esm builds).
// esbuild transpiles to a modern target, so there are no transpilation helpers
// and thus no @babel/runtime dependency. `three` is externalised (it's a peer,
// injected by the host); lodash/potpack/uuid are bundled so the package ships
// with zero runtime dependencies.
export default defineConfig({
  build: {
    target: 'es2020',
    sourcemap: true,
    lib: {
      entry: resolve(root, 'src/index.js'),
      name: 'Nebula',
      formats: ['es', 'cjs', 'umd'],
      // Explicit extensions disambiguate ESM vs CJS without needing
      // "type": "module" on the package.
      fileName: format =>
        format === 'es'
          ? 'three-nebula.mjs'
          : format === 'cjs'
            ? 'three-nebula.cjs'
            : 'three-nebula.umd.js',
    },
    rollupOptions: {
      external: ['three'],
      output: { globals: { three: 'THREE' } },
    },
  },
});
