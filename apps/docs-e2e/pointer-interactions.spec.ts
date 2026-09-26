import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ hasTouch: true });

async function viewport(graph: Locator) {
  return graph.locator('.vflow-viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function connectionGraph(page: Page) {
  await page.goto('/edges/connections');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('.vflow-node')).toHaveCount(2);
  const source = graph.locator('.vflow-node').nth(0).locator('.vflow-handle[data-vflow-handle-type="source"]');
  const target = graph.locator('.vflow-node').nth(1).locator('.vflow-handle[data-vflow-handle-type="target"]');
  await expect(source).toBeVisible();
  return { graph, source, target };
}

test('connects two handles with the mouse without panning', async ({ page }) => {
  const { graph, source, target } = await connectionGraph(page);
  const start = await viewport(graph);
  const from = await center(source);
  const to = await center(target);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();

  await expect(graph.locator('[edge]')).toHaveCount(1);
  expect(await viewport(graph)).toEqual(start);
});

test('connects two handles with a finger: the finger reports the handle it is released on', async ({ page }) => {
  const { graph, source, target } = await connectionGraph(page);
  const start = await viewport(graph);
  const from = await center(source);
  const to = await center(target);
  const cdp = await page.context().newCDPSession(page);

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
  for (let i = 1; i <= 8; i++) {
    const point = { x: from.x + ((to.x - from.x) * i) / 8, y: from.y + ((to.y - from.y) * i) / 8 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, id: 1 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  await expect(graph.locator('[edge]')).toHaveCount(1);
  expect(await viewport(graph)).toEqual(start);
});

test('drops a reconnected edge on the canvas without panning the viewport', async ({ page }) => {
  await page.goto('/edges/connections');
  const graph = page.locator('vflow').nth(3);
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('[edge]')).toHaveCount(2);
  const start = await viewport(graph);
  const handle = graph.locator('.reconnect-handle').first();
  const from = await center(handle);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 40, from.y + 120, { steps: 8 });
  await page.mouse.up();

  // The demo removes an edge whose reconnection is dropped.
  await expect(graph.locator('[edge]')).toHaveCount(1);
  expect(await viewport(graph)).toEqual(start);
});

test('selects nodes with a Shift selection box instead of panning', async ({ page }) => {
  await page.goto('/interactions/selection-box');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('.vflow-node').first()).toBeVisible();
  const pane = (await graph.locator('.vflow-pane').boundingBox())!;
  const start = await viewport(graph);

  await page.keyboard.down('Shift');
  await page.mouse.move(pane.x + 5, pane.y + 5);
  await page.mouse.down();
  await page.mouse.move(pane.x + pane.width - 5, pane.y + pane.height - 5, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.up('Shift');

  const selected = graph.locator('.vflow-node [data-vui-selected="true"]');
  await expect(selected).not.toHaveCount(0);
  expect(await viewport(graph)).toEqual(start);
});
