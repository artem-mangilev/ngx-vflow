import { expect, test } from '@playwright/test';

test('a flow that starts with edges reports no edge change until one happens', async ({ page }) => {
  await page.goto('/docs/interactions/handling-changes');
  const demo = page.locator('docs-demo').first();
  const flow = demo.locator('vflow');
  const readout = demo.getByRole('definition').nth(1);
  await expect(flow.locator('[data-v-edge]')).toHaveCount(2);
  await expect(flow.locator('[data-v-node="review"]')).toBeVisible();

  // The edges exist before their handles are rendered; they must not be reported as detached on the way.
  await page.waitForTimeout(500);
  await expect(readout).toHaveText('nothing yet');

  await demo.scrollIntoViewIfNeeded();
  // The edge between Draft and Review is a straight line between the facing sides of the two cards.
  const draft = (await flow.locator('[data-v-node="draft"]').boundingBox())!;
  const review = (await flow.locator('[data-v-node="review"]').boundingBox())!;
  await page.mouse.click((draft.x + draft.width + review.x) / 2, draft.y + draft.height / 2);
  await expect(readout).toHaveText('draft-review selected');
});
