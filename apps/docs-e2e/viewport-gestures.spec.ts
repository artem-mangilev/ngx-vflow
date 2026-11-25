import { center, expect, paneBox, test, touchscreen, viewport, type Page } from './fixtures';

test.use({ hasTouch: true });

async function open(page: Page) {
  await page.goto('/docs/viewport/viewport-gestures');
  const flow = page.locator('vflow');
  await flow.scrollIntoViewIfNeeded();
  const pane = await paneBox(flow);
  // An empty canvas point, away from nodes and edges.
  const empty = { x: pane.x + pane.width - 40, y: pane.y + pane.height - 30 };
  return { flow, pane, empty };
}

test('a real wheel zooms in around the cursor', async ({ page }) => {
  const { flow, pane, empty } = await open(page);
  const before = await viewport(flow);
  const flowX = (empty.x - pane.x - before.x) / before.zoom;

  await page.mouse.move(empty.x, empty.y);
  await page.mouse.wheel(0, -100);

  await expect.poll(async () => (await viewport(flow)).zoom).toBeGreaterThan(before.zoom);
  await expect
    .poll(async () => {
      const zoomed = await viewport(flow);
      return (empty.x - pane.x - zoomed.x) / zoomed.zoom;
    })
    .toBeCloseTo(flowX, 1);
});

test('a real finger pans the viewport by the distance it moves', async ({ page }) => {
  const { flow, empty } = await open(page);
  const touch = await touchscreen(page);
  const start = await viewport(flow);

  await touch('touchStart', [empty]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [{ x: empty.x - 10 * i, y: empty.y - 5 * i }]);
  await touch('touchEnd');

  await expect.poll(async () => (await viewport(flow)).x - start.x).toBeCloseTo(-60, 0);
  expect((await viewport(flow)).y - start.y).toBeCloseTo(-30, 0);
});

test('a double click zooms in around the pointer and Fit view brings every node back', async ({ page }) => {
  const { flow, pane, empty } = await open(page);
  const before = await viewport(flow);

  await page.mouse.dblclick(empty.x, empty.y);
  await expect.poll(async () => (await viewport(flow)).zoom).toBeCloseTo(before.zoom * 2, 5);
  const zoomed = await viewport(flow);
  expect((empty.x - pane.x - zoomed.x) / zoomed.zoom).toBeCloseTo((empty.x - pane.x - before.x) / before.zoom, 2);

  await page.getByRole('button', { name: 'Fit view' }).click();
  await expect(async () => {
    for (const box of await flow
      .locator('[data-v-node]')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON() as DOMRect))) {
      expect(box.left).toBeGreaterThanOrEqual(pane.x - 1);
      expect(box.right).toBeLessThanOrEqual(pane.x + pane.width + 1);
    }
  }).toPass();
});

test('drags a node without panning and without the click that selects it', async ({ page }) => {
  const { flow } = await open(page);
  const node = flow.locator('[data-v-node="order"]');
  const from = await center(node);
  const box = (await node.boundingBox())!;
  const start = await viewport(flow);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 60, from.y + 30, { steps: 6 });
  await page.mouse.up();

  await expect.poll(async () => (await node.boundingBox())!.x - box.x).toBeCloseTo(60, 0);
  expect((await node.boundingBox())!.y - box.y).toBeCloseTo(30, 0);
  expect(await viewport(flow)).toEqual(start);
  await expect(node).not.toHaveAttribute('data-v-selected', '');
});

test('lazy loading moves to the next node and lands with it centered', async ({ page }) => {
  await page.goto('/docs/performance/lazy-loading');
  const flow = page.locator('vflow');
  await flow.scrollIntoViewIfNeeded();
  const initial = await viewport(flow);

  await page.getByRole('button', { name: 'Go to next node' }).click();

  const pane = await paneBox(flow);
  const target = flow.locator('[data-v-node="orders"]');
  await expect(async () => {
    const box = (await target.boundingBox())!;
    expect(box.x + box.width / 2).toBeCloseTo(pane.x + pane.width / 2, 0);
    expect(box.y + box.height / 2).toBeCloseTo(pane.y + pane.height / 2, 0);
  }).toPass();
  expect(await viewport(flow)).not.toEqual(initial);
});
