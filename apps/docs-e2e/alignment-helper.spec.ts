import { center, expect, test } from './fixtures';

test('dragging a node near a neighbour shows guide lines, releasing it removes them', async ({ page }) => {
  await page.goto('/docs/viewport/snapping');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="alerts"]') });
  await flow.scrollIntoViewIfNeeded();
  const guides = flow.locator('[data-v-alignment-guide=line]');

  // Alerts moves level with Metrics, below it on the right.
  const from = await center(flow.locator('[data-v-node="alerts"]'));
  const metrics = await center(flow.locator('[data-v-node="metrics"]'));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, metrics.y + 3, { steps: 8 });
  await expect(guides).not.toHaveCount(0);

  await page.mouse.up();
  await expect(guides).toHaveCount(0);
});
