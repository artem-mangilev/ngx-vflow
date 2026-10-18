import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/** Generators run against an in-memory Nx tree in Node; no browser or Angular compiler is involved. */
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: resolve(import.meta.dirname, '../../node_modules/.vite/cli'),
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    restoreMocks: true,
  },
});
