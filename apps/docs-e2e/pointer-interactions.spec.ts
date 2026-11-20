import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ hasTouch: true });

async function viewport(graph: Locator) {
  return graph.locator('.v-viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function connectionGraph(page: Page) {
  await page.goto('/docs/handles/connections');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('[data-v-node]')).toHaveCount(2);
  const source = graph.locator('[data-v-node]').nth(0).locator('[data-v-handle][data-v-handle-type="source"]');
  const target = graph.locator('[data-v-node]').nth(1).locator('[data-v-handle][data-v-handle-type="target"]');
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
  await page.goto('/docs/handles/connections');
  const graph = page.locator('vflow').nth(3);
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('[edge]')).toHaveCount(2);
  const start = await viewport(graph);
  const handle = graph.locator('[data-v-reconnect-handle]').first();
  const from = await center(handle);
  // The graph is fitted to the center of the pane, where the gap between its two rows of nodes is empty canvas.
  const to = await center(graph.locator('.v-pane'));

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();

  // The demo removes an edge whose reconnection is dropped.
  await expect(graph.locator('[edge]')).toHaveCount(1);
  expect(await viewport(graph)).toEqual(start);
});

test('selects nodes with a Shift selection box instead of panning', async ({ page }) => {
  await page.goto('/docs/interactions/selection');
  // The page has two demos; the selection box is the second.
  const graph = page.locator('vflow').nth(1);
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('[data-v-node]').first()).toBeVisible();
  const pane = (await graph.locator('.v-pane').boundingBox())!;
  const start = await viewport(graph);

  await page.keyboard.down('Shift');
  await page.mouse.move(pane.x + 5, pane.y + 5);
  await page.mouse.down();
  await page.mouse.move(pane.x + pane.width - 5, pane.y + pane.height - 5, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.up('Shift');

  const selected = graph.locator('[data-v-node][data-v-selected]');
  await expect(selected).not.toHaveCount(0);
  expect(await viewport(graph)).toEqual(start);
});

// A hand moves a few pixels between a press and its release. A press on an edge or on a control in an edge label
// belongs to the pane, which pans from the first pixel; within the pane click distance it is still a click.
test('clicks an edge and a control in an edge label although the pointer moves during the press', async ({ page }) => {
  await page.goto('/docs/edges/labels');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('[data-v-edge]')).toHaveCount(2);
  const press = async (at: { x: number; y: number }) => {
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.mouse.move(at.x + 2, at.y + 1);
    await page.mouse.up();
  };

  const line = await graph
    .locator('[data-v-edge] path.vui-edge')
    .first()
    .evaluate((path: SVGPathElement) => {
      const point = path.getPointAtLength(path.getTotalLength() * 0.3);
      const matrix = path.getScreenCTM()!;
      return {
        x: point.x * matrix.a + point.y * matrix.c + matrix.e,
        y: point.x * matrix.b + point.y * matrix.d + matrix.f,
      };
    });
  await press(line);
  await expect(graph.locator('[data-v-edge][data-v-selected]')).toHaveCount(1);

  const remove = graph.getByRole('button', { name: 'Remove' });
  await expect(remove).toBeVisible();
  await press(await center(remove));
  await expect(graph.locator('[data-v-edge]')).toHaveCount(1);
});
