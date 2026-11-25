import { expect, test, viewport } from './fixtures';

test.use({ hasTouch: true });

test('a real touch tap on the minimap moves the viewport and selects no node', async ({ page }) => {
  await page.goto('/docs/viewport/minimap');
  const flow = page.locator('vflow').filter({ has: page.locator('v-minimap') });
  const drawing = flow.locator('v-minimap svg');
  await drawing.scrollIntoViewIfNeeded();
  const start = await viewport(flow);

  // A tap near a corner of the overview centers the pane on a point away from the current view.
  const box = (await drawing.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.15, box.y + box.height * 0.15);

  await expect.poll(async () => (await viewport(flow)).x).not.toBeCloseTo(start.x, 0);
  expect((await viewport(flow)).zoom).toBe(start.zoom);
  await expect(flow.locator('[data-v-node][data-v-selected]')).toHaveCount(0);
});
