import { expect, flowPoint, test } from './fixtures';

test('dagre lays the pipeline out left to right, then top to bottom when the direction changes', async ({ page }) => {
  await page.goto('/packages/layout');
  const demo = page.getByTestId('dagre-demo');
  const node = (id: string) => demo.locator(`[data-v-node="${id}"]`);
  await expect(demo.locator('[data-v-node]')).toHaveCount(7);

  await expect
    .poll(async () => (await flowPoint(node('parse'))).x - (await flowPoint(node('source'))).x)
    .toBeGreaterThan(100);

  await demo.getByRole('button', { name: 'TB', exact: true }).click();
  // The nodes animate into the new layout: parse ends below source, in the same column.
  await expect(async () => {
    const source = await flowPoint(node('source'));
    const parse = await flowPoint(node('parse'));
    expect(parse.y - source.y).toBeGreaterThan(50);
    expect(Math.abs(parse.x - source.x)).toBeLessThan(5);
  }).toPass();
});
