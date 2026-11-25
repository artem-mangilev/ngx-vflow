import { center, drag, expect, paneBox, pathPoint, test, touchscreen, viewport, type Page } from './fixtures';

test.use({ hasTouch: true });

async function connectionGraph(page: Page) {
  await page.goto('/docs/handles/connections');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="sender"]') });
  await flow.scrollIntoViewIfNeeded();
  const source = flow.locator('[data-v-node="sender"] [data-v-handle][data-v-handle-type="source"]');
  const target = flow.locator('[data-v-node="receiver"] [data-v-handle][data-v-handle-type="target"]');
  await expect(source).toBeVisible();
  return { flow, source, target };
}

test('connects two handles with the mouse without panning', async ({ page }) => {
  const { flow, source, target } = await connectionGraph(page);
  const start = await viewport(flow);

  await drag(page, source, target, 8);

  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
  expect(await viewport(flow)).toEqual(start);
});

test('connects two handles with a finger: the finger reports the handle it is released on', async ({ page }) => {
  const { flow, source, target } = await connectionGraph(page);
  const start = await viewport(flow);
  const from = await center(source);
  const to = await center(target);
  const touch = await touchscreen(page);

  await touch('touchStart', [from]);
  for (let i = 1; i <= 8; i++) {
    await touch('touchMove', [{ x: from.x + ((to.x - from.x) * i) / 8, y: from.y + ((to.y - from.y) * i) / 8 }]);
  }
  await touch('touchEnd');

  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
  expect(await viewport(flow)).toEqual(start);
});

test('drops a reconnected edge on the canvas without panning the viewport', async ({ page }) => {
  await page.goto('/docs/handles/connections');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="orders"]') });
  await flow.scrollIntoViewIfNeeded();
  await expect(flow.locator('[data-v-edge]')).toHaveCount(2);
  const start = await viewport(flow);
  const pane = await paneBox(flow);

  // The graph is fitted to the center of the pane, where the gap between its two rows of nodes is empty canvas.
  await drag(
    page,
    flow.locator('[data-v-edge="returns-support"] [data-v-reconnect-handle]'),
    {
      x: pane.x + pane.width / 2,
      y: pane.y + pane.height / 2,
    },
    8,
  );

  // The demo removes an edge whose reconnection is dropped.
  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
  expect(await viewport(flow)).toEqual(start);
});

test('selects nodes with a Shift selection box instead of panning', async ({ page }) => {
  await page.goto('/docs/interactions/selection');
  const flow = page
    .locator('docs-demo')
    .filter({ has: page.getByLabel('Selection box mode') })
    .locator('vflow');
  await flow.scrollIntoViewIfNeeded();
  const pane = await paneBox(flow);
  const start = await viewport(flow);

  await page.keyboard.down('Shift');
  await drag(page, { x: pane.x + 5, y: pane.y + 5 }, { x: pane.x + pane.width - 5, y: pane.y + pane.height - 5 });
  await page.keyboard.up('Shift');

  await expect(flow.locator('[data-v-node][data-v-selected]')).toHaveCount(4);
  expect(await viewport(flow)).toEqual(start);
});

// A hand moves a few pixels between a press and its release. A press on an edge or on a control in an edge label
// belongs to the pane, which pans from the first pixel; within the pane click distance it is still a click.
async function labelsGraph(page: Page) {
  await page.goto('/docs/edges/labels');
  const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="customer"]') });
  await flow.scrollIntoViewIfNeeded();
  await expect(flow.locator('[data-v-edge]')).toHaveCount(2);
  const press = async (at: { x: number; y: number }) => {
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.mouse.move(at.x + 2, at.y + 1);
    await page.mouse.up();
  };
  return { flow, press };
}

test('clicks an edge although the pointer moves during the press', async ({ page }) => {
  const { flow, press } = await labelsGraph(page);

  await press(await pathPoint(flow.locator('[data-v-edge="customer-order"] [data-v-interactive-edge]'), 0.3));

  await expect(flow.locator('[data-v-edge="customer-order"]')).toHaveAttribute('data-v-selected', '');
});

test('clicks a control in an edge label although the pointer moves during the press', async ({ page }) => {
  const { flow, press } = await labelsGraph(page);
  await press(await pathPoint(flow.locator('[data-v-edge="customer-order"] [data-v-interactive-edge]'), 0.3));
  const remove = flow.getByRole('button', { name: 'Remove' });
  await expect(remove).toBeVisible();

  await press(await center(remove));

  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
});

test('clicks a node although the pointer moves during the press, and the node keeps its place', async ({ page }) => {
  const { flow, press } = await labelsGraph(page);
  const node = flow.locator('[data-v-node="customer"]');
  const before = await node.boundingBox();

  // The movement stays under the node drag threshold.
  await press(await center(node));

  await expect(node).toHaveAttribute('data-v-selected', '');
  expect(await node.boundingBox()).toEqual(before);
});
