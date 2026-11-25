/// <reference types="@vitest/browser/providers/playwright" />
import angular from '@analogjs/vite-plugin-angular';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

/** This package: its package.json holds what the configuration imports, and the TestBed setup files are here. */
const setupRoot = import.meta.dirname;
const workspaceRoot = resolve(setupRoot, '../..');

/** The `paths` of the root tsconfig as Vite aliases, so specs import `ngx-vflow` and friends from source. */
function tsconfigPathAliases() {
  const { paths } = JSON.parse(readFileSync(resolve(workspaceRoot, 'tsconfig.json'), 'utf8')).compilerOptions as {
    paths: Record<string, string[]>;
  };

  return Object.entries(paths).map(([key, [target]]) => {
    const escaped = key.replace(/[.+?^${}()|[\]\\/]/g, '\\$&');

    return key.endsWith('/*')
      ? {
          find: new RegExp(`^${escaped.slice(0, -1)}(.*)$`),
          replacement: `${resolve(workspaceRoot, target.slice(0, -1))}$1`,
        }
      : { find: new RegExp(`^${escaped}$`), replacement: resolve(workspaceRoot, target) };
  });
}

/**
 * Specs of a project run in Chromium: they measure layout, dispatch pointer events and read computed styles.
 * `projectRoot` holds `tsconfig.spec.json`; `test-setup.ts` of this package initializes a zoneless TestBed.
 */
export function defineAngularTestConfig(projectRoot: string, include: string[]): ViteUserConfig {
  return defineConfig({
    root: projectRoot,
    cacheDir: resolve(setupRoot, 'node_modules/.vite', basename(projectRoot)),
    plugins: [angular({ tsconfig: resolve(projectRoot, 'tsconfig.spec.json'), workspaceRoot })],
    resolve: { alias: tsconfigPathAliases() },
    // A project with its own package.json would otherwise not serve files of the rest of the workspace.
    server: { fs: { allow: [workspaceRoot] } },
    test: {
      globals: true,
      include,
      setupFiles: [resolve(setupRoot, 'test-setup.ts')],
      // Like Jasmine, restore every spy after its test.
      restoreMocks: true,
      // Off unless a run asks for it (`--coverage`, the `coverage` configuration of the test target): the sources of
      // the project, without its specs and the helpers of specs.
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['**/*.spec.ts', '**/*.testing.ts', '**/public-api.ts', '**/index.ts'],
        reporter: ['text-summary', 'json-summary'],
        reportsDirectory: resolve(workspaceRoot, 'coverage', basename(projectRoot)),
        // A floor under every library, not a target: each of them is well above it.
        thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
      },
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: true,
        screenshotFailures: false,
        instances: [{ browser: 'chromium' }],
      },
    },
  });
}

/**
 * Specs of a project in jsdom and happy-dom, the environments of `ng test` without `--browsers`: they have no
 * layout, so they only prove that the library renders and reacts there. Each environment runs twice, zoneless
 * and with zone.js, which patches listeners and observers differently in each of them.
 */
export function defineAngularNodeDomTestConfig(projectRoot: string, include: string[]): ViteUserConfig {
  const { test, ...config } = defineAngularTestConfig(projectRoot, include);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { browser, setupFiles, ...shared } = test!;

  return {
    ...config,
    test: {
      ...shared,
      // Component styles decide what is visible, so they are processed as an application build does.
      css: true,
      projects: ['jsdom', 'happy-dom'].flatMap((environment) =>
        ['test-setup.ts', 'test-setup.zone.ts'].map((setup) => ({
          extends: true,
          test: {
            name: setup.includes('zone') ? `${environment} zone.js` : environment,
            environment,
            setupFiles: [resolve(setupRoot, setup)],
          },
        })),
      ),
    },
  };
}

/**
 * Specs of a project on the server: Node without a DOM of its own, where `@angular/platform-server` renders an
 * application into a string, as a server render and a prerender of a build do. No TestBed: a spec bootstraps an
 * application with `renderApplication`.
 */
export function defineAngularServerTestConfig(projectRoot: string, include: string[]): ViteUserConfig {
  const { test, ...config } = defineAngularTestConfig(projectRoot, include);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { browser, setupFiles, ...shared } = test!;

  return { ...config, test: { ...shared, name: 'server', environment: 'node' } };
}
