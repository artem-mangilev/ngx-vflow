import { center, drag, expect, test, type Locator, type Page } from './fixtures';

async function open(page: Page, recipe: string) {
  await page.goto(`/examples/recipes/${recipe}`);
  const flow = page.locator('vflow');
  await flow.scrollIntoViewIfNeeded();
  return flow;
}

/** A point of the pane with no node or edge under it: the top left corner inside the fitView padding. */
async function emptyPoint(flow: Locator) {
  const box = (await flow.boundingBox())!;
  return { x: box.x + 12, y: box.y + 12 };
}

test('undo and redo restore a move', async ({ page }) => {
  const flow = await open(page, 'undo-redo');
  const review = flow.locator('[data-v-node="review"]');
  const before = await center(review);

  await drag(page, before, { x: before.x + 80, y: before.y + 40 }, 12);
  await expect.poll(async () => (await center(review)).x).toBeGreaterThan(before.x + 60);
  const moved = await center(review);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect.poll(() => center(review)).toEqual(before);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect.poll(() => center(review)).toEqual(moved);
});

test('Mod+Z undoes a connection and Mod+Shift+Z redoes it', async ({ page }) => {
  const flow = await open(page, 'undo-redo');
  const edges = flow.locator('[data-v-edge]');
  await expect(edges).toHaveCount(2);

  await drag(
    page,
    flow.locator('[data-v-node="publish"] [data-v-handle-type="source"]'),
    flow.locator('[data-v-node="archive"] [data-v-handle-type="target"]'),
    12,
  );
  await expect(edges).toHaveCount(3);

  await flow.locator('[data-v-node="draft"]').focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(edges).toHaveCount(2);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(edges).toHaveCount(3);
});

test('Mod+Z brings back a node deleted from the keyboard with its edges', async ({ page }) => {
  const flow = await open(page, 'undo-redo');
  const edges = flow.locator('[data-v-edge]');
  const review = flow.locator('[data-v-node="review"]');
  await expect(edges).toHaveCount(2);

  await review.focus();
  await page.keyboard.press('Delete');
  await expect(review).toHaveCount(0);
  await expect(edges).toHaveCount(0);

  await flow.locator('[data-v-node="draft"]').focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(review).toHaveCount(1);
  await expect(edges).toHaveCount(2);
});

test('copy and paste duplicate the selected nodes with the edges between them', async ({ page }) => {
  const flow = await open(page, 'copy-paste');
  const nodes = flow.locator('[data-v-node]');
  const edges = flow.locator('[data-v-edge]');
  const selected = flow.locator('[data-v-node][data-v-selected]');

  // Parse and Store start selected; only the edge between them goes along, and the copies are selected.
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await expect(nodes).toHaveCount(5);
  await expect(edges).toHaveCount(3);
  await expect(selected).toHaveCount(2);
  await expect(flow.locator('[data-v-node="parse"]')).not.toHaveAttribute('data-v-selected', '');

  // A second paste lands further away instead of on top of the first one.
  const first = Math.min(...(await selected.evaluateAll((all) => all.map((node) => node.getBoundingClientRect().x))));
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await expect(nodes).toHaveCount(7);
  await expect
    .poll(async () =>
      Math.min(...(await selected.evaluateAll((all) => all.map((node) => node.getBoundingClientRect().x)))),
    )
    .toBeGreaterThan(first);
});

test('Mod+D duplicates the clicked node', async ({ page }) => {
  const flow = await open(page, 'copy-paste');
  await flow.locator('[data-v-node="fetch"]').click();
  await page.keyboard.press('ControlOrMeta+d');
  await expect(flow.locator('[data-v-node]')).toHaveCount(4);
});

test('the context menu duplicates the node it was opened on', async ({ page }) => {
  const flow = await open(page, 'context-menu');
  const menu = page.getByRole('menu');

  await flow.locator('[data-v-node="lead"]').click({ button: 'right' });
  await expect(menu.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await menu.getByRole('menuitem', { name: 'Duplicate' }).click();

  await expect(flow.locator('[data-v-node]')).toHaveCount(4);
  await expect(menu).toHaveCount(0);
});

test('Escape closes the context menu', async ({ page }) => {
  const flow = await open(page, 'context-menu');
  const menu = page.getByRole('menu');

  await flow.locator('[data-v-node="call"]').click({ button: 'right' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
});

test('the context menu deletes the node it was opened on with its edges', async ({ page }) => {
  const flow = await open(page, 'context-menu');

  await flow.locator('[data-v-node="deal"]').click({ button: 'right' });
  await page.getByRole('menu').getByRole('menuitem', { name: 'Delete node' }).click();

  await expect(flow.locator('[data-v-node]')).toHaveCount(2);
  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
});

test('the context menu adds a node at the point of the canvas it was opened on', async ({ page }) => {
  const flow = await open(page, 'context-menu');
  const point = await emptyPoint(flow);

  await page.mouse.click(point.x, point.y, { button: 'right' });
  await page.getByRole('menu').getByRole('menuitem', { name: 'Add node here' }).click();

  const added = flow.locator('[data-v-node]').filter({ hasText: 'New step' });
  await expect(added).toHaveCount(1);
  const box = (await added.boundingBox())!;
  expect(Math.abs(box.x - point.x)).toBeLessThan(2);
  expect(Math.abs(box.y - point.y)).toBeLessThan(2);
});

test('a connection released over the canvas adds a connected node there', async ({ page }) => {
  const flow = await open(page, 'add-node-on-drop');
  const added = flow.locator('[data-v-node]:not([data-v-node="start"], [data-v-node="end"])');
  const edges = flow.locator('[data-v-edge]');
  const box = (await flow.boundingBox())!;
  const drop = { x: box.x + box.width / 2, y: box.y + box.height - 40 };

  await drag(page, flow.locator('[data-v-node="start"] [data-v-handle-type="source"]'), drop, 12);
  await expect(added).toHaveCount(1);
  await expect(edges).toHaveCount(1);
  // The target handle of the new node lies under the pointer.
  const handle = await center(added.locator('[data-v-handle-type="target"]'));
  expect(Math.abs(handle.x - drop.x)).toBeLessThan(8);
  expect(Math.abs(handle.y - drop.y)).toBeLessThan(8);
});

test('a connection released on a handle is an ordinary edge and adds no node', async ({ page }) => {
  const flow = await open(page, 'add-node-on-drop');

  await drag(
    page,
    flow.locator('[data-v-node="start"] [data-v-handle-type="source"]'),
    flow.locator('[data-v-node="end"] [data-v-handle-type="target"]'),
    12,
  );

  await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
  await expect(flow.locator('[data-v-node]')).toHaveCount(2);
});
