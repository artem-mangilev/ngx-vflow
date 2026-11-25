import { drag, expect, test, type Locator } from './fixtures';

/** Pixels that layout rounding may add between a node box and the controls drawn around it. */
const TOLERANCE = 1.5;

/** The resize lines frame the card: the top one spans its width, the left one its height. */
async function expectOutline(node: Locator, card: Locator) {
  await expect(async () => {
    const box = (await card.boundingBox())!;
    const top = (await node.locator('[data-v-resize-control=line][data-v-resize-control-position=top]').boundingBox())!;
    const left = (await node
      .locator('[data-v-resize-control=line][data-v-resize-control-position=left]')
      .boundingBox())!;
    expect(Math.abs(top.x - box.x)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(top.width - box.width)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(left.y - box.y)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(left.height - box.height)).toBeLessThanOrEqual(TOLERANCE);
  }).toPass();
}

test('overview: the selected group shows its resizer and grows by the dragged distance', async ({ page }) => {
  await page.goto('/examples/feature-overview');
  const node = page.getByRole('group', { name: 'Fulfilment', exact: true });
  const group = node.locator('section');
  await node.scrollIntoViewIfNeeded();
  await expect(node.locator('[data-v-resize-control]')).toHaveCount(0);

  await group.locator('header').click();
  await expect(node.locator('[data-v-resize-control]')).toHaveCount(8);
  await expectOutline(node, group);

  const before = (await group.boundingBox())!;
  const corner = node.locator('[data-v-resize-control=handle][data-v-resize-control-position=bottom-right]');
  const from = (await corner.boundingBox())!;
  await drag(page, corner, { x: from.x + from.width / 2 + 40, y: from.y + from.height / 2 + 30 });

  await expect.poll(async () => (await group.boundingBox())!.width - before.width).toBeCloseTo(40, 0);
  await expect.poll(async () => (await group.boundingBox())!.height - before.height).toBeCloseTo(30, 0);
  await expectOutline(node, group);
});
