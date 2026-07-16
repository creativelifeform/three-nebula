import { defineConfig } from 'vitest/config';

// Test runner (replaces mocha + @babel/register + nyc). Vitest transpiles via
// esbuild, so no babel is involved. The existing specs keep using chai + sinon
// and set up their own DOM via `domino`, so the environment stays 'node'.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
    },
  },
});
