import { drag, expect, flowPoint, test } from './fixtures';

test('a parent grows around a child dragged past its side and stays in place', async ({ page }) => {
  await page.goto('/packages/auto-size');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="squad"]') });
  const squad = flow.locator('[data-v-node="squad"]');
  const frontend = flow.locator('[data-v-node="frontend"]');
  await flow.scrollIntoViewIfNeeded();
  const start = await flowPoint(squad);
  const width = (await squad.boundingBox())!.width;

  // A short drag: near the edge of the pane auto-pan would move the view.
  const from = (await frontend.boundingBox())!;
  await drag(page, frontend, { x: from.x + from.width / 2 + 120, y: from.y + from.height / 2 });

  await expect.poll(async () => (await squad.boundingBox())!.width).toBeGreaterThan(width + 60);
  expect(await flowPoint(squad)).toEqual(start);
});
