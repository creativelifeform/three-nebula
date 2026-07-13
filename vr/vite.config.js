import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, '..');

// The harness renders three-nebula from source (not a build), so a change to the
// library's build system can never affect the golden master.
export default defineConfig({
  root: dir,
  resolve: {
    alias: {
      'three-nebula': path.resolve(repoRoot, 'src/index.js'),
    },
  },
  server: {
    fs: { allow: [repoRoot] }, // serve src/ and website/assets/ outside vr/
  },
});
