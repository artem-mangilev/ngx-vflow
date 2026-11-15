import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const docsRoot = import.meta.dirname;

/**
 * Specs of the docs check the logic of demos, so they run in jsdom. They compile with the Angular of the docs and
 * import the libraries through the `paths` of tsconfig.json, like the application: from apps/docs/libs.
 */
export default defineConfig({
  root: docsRoot,
  plugins: [angular({ tsconfig: resolve(docsRoot, 'tsconfig.spec.json'), workspaceRoot: docsRoot })],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: [resolve(docsRoot, 'test-setup.ts')],
    restoreMocks: true,
  },
});
