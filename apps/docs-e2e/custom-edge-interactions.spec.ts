import { expect, pathPoint, test } from './fixtures';

test('an edge can be selected by clicking it and deleted from the keyboard', async ({ page }) => {
  await page.goto('/docs/interactions/deleting');
  const edges = page.locator('vflow [data-v-edge]');
  const selected = page.locator('vflow [data-v-edge][data-v-selected]');
  await expect(edges).toHaveCount(3);
  await expect(selected).toHaveCount(0);

  const edge = page.locator('vflow [data-v-edge="order-invoice"]');
  await edge.scrollIntoViewIfNeeded();
  const middle = await pathPoint(edge.locator('[data-v-interactive-edge]'), 0.5);
  await page.mouse.click(middle.x, middle.y);
  await expect(selected).toHaveCount(1);

  await edge.focus();
  await page.keyboard.press('Backspace');
  await expect(edges).toHaveCount(2);
  await expect(page.getByText('Removed 0 nodes and 1 edge.')).toBeVisible();

  // The application owns the graph, so it can bring the removed edge back.
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(edges).toHaveCount(3);
});
