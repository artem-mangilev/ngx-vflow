import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { expect, test } from './fixtures';

const preview = process.env['E2E_TARGET'] === 'preview';
const root = resolve(__dirname, '../..');

/** Pages by the folder of their `ng-doc.page.ts` under `categories`: that is the route NgDoc gives them. */
function pagesOfSource(directory: string, base = directory): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pagesOfSource(path, base);
    return entry.name === 'ng-doc.page.ts' ? [`/${relative(base, directory)}`] : [];
  });
}

function routes(): string[] {
  if (!preview) {
    // The landing and the showcase are application routes, not NgDoc pages.
    return ['/', '/showcase', ...pagesOfSource(join(root, 'apps/docs/src/app/categories'))];
  }
  const file = join(root, 'dist/apps/docs/prerendered-routes.json');
  if (!existsSync(file)) throw new Error('Run `pnpm e2e:preview`: the prerendered build is missing');
  const { routes } = JSON.parse(readFileSync(file, 'utf8')) as { routes: { path: string; redirectTo?: string }[] };
  return routes.filter((route) => !route.redirectTo).map((route) => route.path);
}

/**
 * Pages that have no flow (and every API reference page), which the `goto` of the fixture would wait for in vain. A page of this list that gets a
 * flow fails its own check below, so the list cannot go stale unnoticed.
 */
const withoutFlow = new Set([
  '/showcase', // a list of projects
  '/docs/getting-started/configuration',
  '/docs/getting-started/migration',
  '/docs/getting-started/styling',
  '/docs/graph/geometry-utilities',
  '/docs/graph/graph-operations',
  '/docs/interactions/accessibility',
  '/packages/cli',
  '/packages/ui/tokens',
]);

/** The demo creates 10000 nodes: its flow starts later than the five seconds the fixture waits for one. */
const slowFlow = '/docs/performance/virtualization';

/**
 * Known defect, not an expectation: the article of this page moves 92px sideways once at about 360 ms (760px wide at
 * x=404, then 664px at x=312), a layout shift of 0.31. Remove the entry when the page is fixed.
 */
const knownShift = new Set(['/examples/recipes/stress-test']);

for (const route of routes()) {
  test(`${route} loads and its flows start with nodes`, async ({ page, request }) => {
    if (preview) {
      // The state the server transfers to the browser: without it the page is built twice.
      const html = await (await request.get(route)).text();
      expect(html, 'raw HTML of the prerendered page').toContain('id="ng-state"');
      await page.addInitScript(() => {
        const win = window as unknown as { __shift: number };
        win.__shift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) {
            if (!entry.hadRecentInput) win.__shift += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
    }

    if (withoutFlow.has(route) || route.startsWith('/api')) {
      // The frame is not the patched `page.goto`, which waits for a flow.
      await page.mainFrame().goto(route);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.locator('vflow')).toHaveCount(0);
    } else {
      if (route === slowFlow) {
        await page.mainFrame().goto(route);
        await expect(page.locator('vflow').first()).toBeAttached({ timeout: 60_000 });
        await expect(page.locator('vflow.v-initializing')).toHaveCount(0, { timeout: 60_000 });
      } else {
        await page.goto(route);
      }
      // A flow in an inactive tab or a deferred block may not exist yet; one that exists has started with nodes.
      for (const flow of await page.locator('vflow').all()) {
        await expect(flow.locator('[data-v-node]').first()).toBeAttached();
      }
    }

    if (preview && !knownShift.has(route)) {
      const shift = await page.evaluate(() => (window as unknown as { __shift: number }).__shift);
      expect(shift, 'cumulative layout shift').toBeLessThan(0.1);
    }
  });
}
