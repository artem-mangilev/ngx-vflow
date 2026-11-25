import { expect, test } from './fixtures';

test("an edge's marker-end url resolves to an existing marker", async ({ page }) => {
  await page.goto('/docs/edges/markers');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-edge="web-api"]') });
  const path = flow.locator('[data-v-edge="web-api"] path[marker-end]');
  await expect(path).toBeAttached();

  const id = /^url\(#(.+)\)$/.exec((await path.getAttribute('marker-end'))!)![1];
  await expect(flow.locator(`marker[id="${id}"]`)).toHaveCount(1);
});
