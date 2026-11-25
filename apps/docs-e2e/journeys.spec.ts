import { center, expect, flowPoint, test } from './fixtures';

test('a node is reached with Tab, moved with the arrow keys and deleted with Delete', async ({ page }) => {
  await page.goto('/docs/interactions/deleting');
  const flow = page.locator('vflow').first();
  const order = flow.locator('[data-v-node="order"]');
  await flow.scrollIntoViewIfNeeded();

  // Tab through the page from its start, the way a keyboard user does, until the first node takes focus.
  await expect(async () => {
    await page.keyboard.press('Tab');
    await expect(order).toBeFocused({ timeout: 100 });
  }).toPass({ intervals: [0], timeout: 20_000 });

  // Move works on the selected, focused node.
  await page.keyboard.press('Enter');
  await expect(order).toHaveAttribute('data-v-selected');
  const before = await flowPoint(order);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => flowPoint(order)).toEqual({ x: before.x + 5, y: before.y });

  await page.keyboard.press('Delete');
  await expect(order).toHaveCount(0);
  await expect(page.getByText('Removed 1 node and 2 edges.')).toBeVisible();
});

test('client-side navigation between two pages with flows leaves both working', async ({ page }) => {
  await page.goto('/docs/edges/curves');
  await page.evaluate(() => ((window as unknown as { __document: boolean }).__document = true));

  await page.getByRole('link', { name: 'Markers', exact: true }).first().click();
  await expect(page).toHaveURL(/\/docs\/edges\/markers$/);
  await expect(page.locator('vflow').first()).toBeAttached();
  await expect(page.locator('vflow.v-initializing')).toHaveCount(0);
  await expect(page.locator('vflow').first().locator('[data-v-node]').first()).toBeAttached();

  await page.getByRole('link', { name: 'Curves', exact: true }).first().click();
  await expect(page).toHaveURL(/\/docs\/edges\/curves$/);
  await expect(page.locator('vflow.v-initializing')).toHaveCount(0);
  await expect(page.locator('vflow').first().locator('[data-v-node]').first()).toBeAttached();

  // The same document throughout: the links navigated, the page did not reload.
  expect(await page.evaluate(() => (window as unknown as { __document?: boolean }).__document)).toBe(true);
});

test.describe('connection validation', () => {
  async function open(page: import('./fixtures').Page) {
    await page.goto('/docs/handles/connections');
    const flow = page.locator('vflow').filter({ has: page.locator('[data-v-node="number-out"]') });
    await flow.scrollIntoViewIfNeeded();
    const handle = (node: string, type: 'source' | 'target') =>
      flow.locator(`[data-v-node="${node}"] [data-v-handle-type="${type}"]`);
    return { flow, handle };
  }

  test('a connection between different value types is flagged invalid and creates no edge', async ({ page }) => {
    const { flow, handle } = await open(page);
    const to = handle('text-in', 'target');
    const from = await center(handle('number-out', 'source'));
    const end = await center(to);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await expect(to).toHaveAttribute('data-v-handle-state', 'invalid');
    await page.mouse.up();

    await expect(to).toHaveAttribute('data-v-handle-state', 'idle');
    await expect(flow.locator('[data-v-edge]')).toHaveCount(0);
  });

  test('a connection between equal value types is flagged valid and the drop creates an edge', async ({ page }) => {
    const { flow, handle } = await open(page);
    const to = handle('number-in', 'target');
    const from = await center(handle('number-out', 'source'));
    const end = await center(to);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await expect(to).toHaveAttribute('data-v-handle-state', 'valid');
    await page.mouse.up();

    await expect(flow.locator('[data-v-edge]')).toHaveCount(1);
    await expect(to).toHaveAttribute('data-v-handle-state', 'idle');
  });
});
