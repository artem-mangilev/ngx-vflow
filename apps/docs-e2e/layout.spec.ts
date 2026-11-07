import { expect, test } from '@playwright/test';

/** Flow-space position of a node, from the transform the flow sets, so pan and zoom do not matter. */
async function flowPoint(page: import('@playwright/test').Page, id: string) {
  return page
    .locator(`vflow [data-v-node="${id}"]`)
    .first()
    .evaluate((element: HTMLElement) => {
      const [x, y] = element.style.transform.match(/-?[\d.]+/g)!.map(Number);
      return { x, y };
    });
}

test('dagre lays the pipeline out left to right, then top to bottom when the direction changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  await page.goto('/packages/layout');
  const flow = page.locator('vflow').first();
  await expect(flow.locator('[data-v-node]')).toHaveCount(8);

  // The first demo starts left to right: every edge goes right, and the stage contains its children.
  await expect
    .poll(async () => (await flowPoint(page, 'parse')).x - (await flowPoint(page, 'source')).x)
    .toBeGreaterThan(100);
  expect((await flowPoint(page, 'validate')).x).toBeGreaterThan((await flowPoint(page, 'parse')).x + 100);
  expect((await flowPoint(page, 'reduce')).x).toBeGreaterThan((await flowPoint(page, 'map')).x + 100);
  const stage = (await flow.locator('[data-v-node="stage"]').boundingBox())!;
  for (const id of ['map', 'reduce']) {
    const box = (await flow.locator(`[data-v-node="${id}"]`).boundingBox())!;
    expect(box.x).toBeGreaterThan(stage.x);
    expect(box.x + box.width).toBeLessThan(stage.x + stage.width);
    expect(box.y).toBeGreaterThan(stage.y);
    expect(box.y + box.height).toBeLessThan(stage.y + stage.height);
  }

  await page.getByRole('button', { name: 'TB', exact: true }).first().click();
  // The nodes animate into the new layout: wait until parse sits below source, in the same column.
  await expect
    .poll(
      async () => {
        const source = await flowPoint(page, 'source');
        const parse = await flowPoint(page, 'parse');
        return parse.y - source.y > 50 && Math.abs(parse.x - source.x) < 5;
      },
      { timeout: 5000 },
    )
    .toBe(true);
  const parse = await flowPoint(page, 'parse');
  const validate = await flowPoint(page, 'validate');
  expect(validate.y).toBeGreaterThan(parse.y + 50);
  expect(errors).toEqual([]);
});
