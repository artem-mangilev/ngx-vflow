import { expect, test, type Locator, type Page } from '@playwright/test';

async function open(page: Page, recipe: string) {
  await page.goto(`/examples/recipes/${recipe}`);
  const flow = page.locator('vflow');
  await expect(flow.locator('[data-v-node]').first()).toBeVisible();
  await flow.scrollIntoViewIfNeeded();
  return flow;
}

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

/** A point of the pane with no node or edge under it: the top left corner inside the fitView padding. */
async function emptyPoint(flow: Locator) {
  const box = (await flow.boundingBox())!;
  return { x: box.x + 12, y: box.y + 12 };
}

test('undo and redo restore a move, a connection and a deletion', async ({ page }) => {
  const flow = await open(page, 'undo-redo');
  const review = flow.locator('[data-v-node="review"]');
  const before = await center(review);

  await drag(page, before, { x: before.x + 80, y: before.y + 40 });
  const moved = await center(review);
  expect(moved.x).toBeGreaterThan(before.x + 60);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect.poll(() => center(review)).toEqual(before);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect.poll(() => center(review)).toEqual(moved);

  // Connect Publish to Archive, then delete Archive from the keyboard, then undo both with Mod+Z.
  const edges = flow.locator('[data-v-edge]');
  await expect(edges).toHaveCount(2);
  await drag(
    page,
    await center(flow.locator('[data-v-node="publish"] [data-v-handle-type="source"]')),
    await center(flow.locator('[data-v-node="archive"] [data-v-handle-type="target"]')),
  );
  await expect(edges).toHaveCount(3);

  const archive = flow.locator('[data-v-node="archive"]');
  await archive.focus();
  await page.keyboard.press('Delete');
  await expect(archive).toHaveCount(0);
  await expect(edges).toHaveCount(2);

  await flow.locator('[data-v-node="draft"]').focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(archive).toHaveCount(1);
  await expect(edges).toHaveCount(3);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(edges).toHaveCount(2);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(edges).toHaveCount(3);
});

test('copy and paste duplicate the selected nodes with the edges between them', async ({ page }) => {
  const flow = await open(page, 'copy-paste');
  const nodes = flow.locator('[data-v-node]');
  const edges = flow.locator('[data-v-edge]');

  // Parse and Store start selected; only the edge between them goes along.
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await expect(nodes).toHaveCount(5);
  await expect(edges).toHaveCount(3);
  await expect(flow.locator('[data-v-node][data-v-selected]')).toHaveCount(2);

  // A second paste lands further away instead of on top of the first one.
  const first = await nodes.nth(3).boundingBox();
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await expect(nodes).toHaveCount(7);
  expect((await nodes.nth(5).boundingBox())!.x).toBeGreaterThan(first!.x);

  await flow.locator('[data-v-node="fetch"]').click();
  await page.keyboard.press('ControlOrMeta+d');
  await expect(nodes).toHaveCount(8);
  await expect(edges).toHaveCount(4);
});

test('the context menu acts on the node, the edge or the point of the canvas it was opened on', async ({ page }) => {
  const flow = await open(page, 'context-menu');
  const nodes = flow.locator('[data-v-node]');
  const edges = flow.locator('[data-v-edge]');
  const menu = page.getByRole('menu');

  await flow.locator('[data-v-node="lead"]').click({ button: 'right' });
  await expect(menu.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await menu.getByRole('menuitem', { name: 'Duplicate' }).click();
  await expect(nodes).toHaveCount(4);
  await expect(menu).toHaveCount(0);

  await flow.locator('[data-v-node="call"]').click({ button: 'right' });
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);

  await flow.locator('[data-v-node="deal"]').click({ button: 'right' });
  await menu.getByRole('menuitem', { name: 'Delete node' }).click();
  await expect(nodes).toHaveCount(3);
  await expect(edges).toHaveCount(1);

  const point = await emptyPoint(flow);
  await page.mouse.click(point.x, point.y, { button: 'right' });
  await menu.getByRole('menuitem', { name: 'Add node here' }).click();
  await expect(nodes).toHaveCount(4);
  const added = (await nodes.last().boundingBox())!;
  expect(Math.abs(added.x - point.x)).toBeLessThan(2);
  expect(Math.abs(added.y - point.y)).toBeLessThan(2);
});

test('a connection released over the canvas adds a connected node there', async ({ page }) => {
  const flow = await open(page, 'add-node-on-drop');
  const nodes = flow.locator('[data-v-node]');
  const edges = flow.locator('[data-v-edge]');
  const box = (await flow.boundingBox())!;
  const drop = { x: box.x + box.width / 2, y: box.y + box.height - 40 };

  await drag(page, await center(flow.locator('[data-v-node="start"] [data-v-handle-type="source"]')), drop);
  await expect(nodes).toHaveCount(3);
  await expect(edges).toHaveCount(1);
  // The target handle of the new node lies under the pointer.
  const handle = await center(nodes.last().locator('[data-v-handle-type="target"]'));
  expect(Math.abs(handle.x - drop.x)).toBeLessThan(8);
  expect(Math.abs(handle.y - drop.y)).toBeLessThan(8);

  // Released on a handle it is an ordinary edge and adds no node.
  await drag(
    page,
    await center(nodes.last().locator('[data-v-handle-type="source"]')),
    await center(flow.locator('[data-v-node="end"] [data-v-handle-type="target"]')),
  );
  await expect(nodes).toHaveCount(3);
  await expect(edges).toHaveCount(2);
});
