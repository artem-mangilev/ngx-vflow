import { expect, pathPoint, test } from './fixtures';

test('a flow that starts with edges reports no edge change until one happens', async ({ page }) => {
  await page.goto('/docs/interactions/handling-changes');
  const demo = page.getByTestId('edge-changes').locator('xpath=ancestor::docs-demo');
  const flow = demo.locator('vflow');
  const readout = demo.getByTestId('edge-changes');
  await expect(flow.locator('[data-v-edge]')).toHaveCount(2);

  // The edges exist before their handles are rendered; once the flow has started they were not reported as detached.
  await expect(readout).toHaveText('nothing yet');

  await demo.scrollIntoViewIfNeeded();
  const middle = await pathPoint(flow.locator('[data-v-edge="draft-review"] [data-v-interactive-edge]'), 0.5);
  await page.mouse.click(middle.x, middle.y);
  await expect(readout).toHaveText('draft-review selected');
});
