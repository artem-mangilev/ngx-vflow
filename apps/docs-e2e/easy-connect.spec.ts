import { expect, Locator, test } from '@playwright/test';

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Distance from a client point to the nearest border of an element. */
async function distanceToBorder(locator: Locator, point: { x: number; y: number }) {
  const box = (await locator.boundingBox())!;
  const inside = point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;
  const toSides = [point.x - box.x, box.x + box.width - point.x, point.y - box.y, box.y + box.height - point.y];
  return inside ? Math.min(...toSides) : Infinity;
}

test('easy connect: connects from anywhere on a node, drags by the title and routes edges through node borders', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/cookbook/easy-connect');
  const demo = page.locator('app-easy-connect-demo');
  await demo.scrollIntoViewIfNeeded();
  const nodes = demo.locator('.easy-node');
  const edges = demo.locator('g[docsEdge] path.vui-edge');
  await expect(nodes).toHaveCount(3);
  await expect(edges).toHaveCount(1);

  // The existing edge starts on the border of its source node, not at a fixed handle.
  const start = await edges.first().evaluate((path: SVGPathElement) => {
    const point = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
    return { x: point.x, y: point.y };
  });
  expect(await distanceToBorder(nodes.nth(0), start)).toBeLessThan(2);

  // A press on the body starts a connection; the candidate under the pointer validates without a port.
  const from = await center(nodes.nth(1).locator('.easy-node__body'));
  const to = await center(nodes.nth(2).locator('.easy-node__body'));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 30, from.y + 30, { steps: 4 });
  await expect(nodes.nth(1)).toHaveAttribute('data-vflow-handle-state', 'connecting');
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await expect(nodes.nth(2)).toHaveAttribute('data-vflow-handle-state', 'valid');
  await page.mouse.up();
  await expect(edges).toHaveCount(2);
  await expect(nodes.nth(1)).toHaveAttribute('data-vflow-handle-state', 'idle');

  // The title drags the node; the body does not.
  const before = (await nodes.nth(0).boundingBox())!;
  const title = await center(nodes.nth(0).locator('.easy-node__title'));
  await page.mouse.move(title.x, title.y);
  await page.mouse.down();
  await page.mouse.move(title.x + 60, title.y + 40, { steps: 6 });
  await page.mouse.up();
  const after = (await nodes.nth(0).boundingBox())!;
  expect(after.x - before.x).toBeGreaterThan(40);
  expect(after.y - before.y).toBeGreaterThan(20);

  expect(errors).toEqual([]);
});
