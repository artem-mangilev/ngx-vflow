/// <reference types="@vitest/browser/providers/playwright" />
import angular from '@analogjs/vite-plugin-angular';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

const workspaceRoot = import.meta.dirname;

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
 * `projectRoot` holds `tsconfig.spec.json`; `test-setup.ts` at the workspace root initializes a zoneless TestBed.
 */
export function defineAngularTestConfig(projectRoot: string, include: string[]): ViteUserConfig {
  return defineConfig({
    root: projectRoot,
    cacheDir: resolve(workspaceRoot, 'node_modules/.vite', basename(projectRoot)),
    plugins: [angular({ tsconfig: resolve(projectRoot, 'tsconfig.spec.json'), workspaceRoot })],
    resolve: { alias: tsconfigPathAliases() },
    // A project with its own package.json would otherwise not serve files of the rest of the workspace.
    server: { fs: { allow: [workspaceRoot] } },
    test: {
      globals: true,
      include,
      setupFiles: [resolve(workspaceRoot, 'test-setup.ts')],
      // Like Jasmine, restore every spy after its test.
      restoreMocks: true,
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
 * layout, so they only prove that the library renders and reacts there.
 */
export function defineAngularNodeDomTestConfig(projectRoot: string, include: string[]): ViteUserConfig {
  const { test, ...config } = defineAngularTestConfig(projectRoot, include);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { browser, ...shared } = test!;

  return {
    ...config,
    test: {
      ...shared,
      // Component styles decide what is visible, so they are processed as an application build does.
      css: true,
      projects: ['jsdom', 'happy-dom'].map((environment) => ({
        extends: true,
        test: { name: environment, environment },
      })),
    },
  };
}
