import { expect, test } from '@playwright/test';

/** Samples of the path in client space. */
async function samples(path: import('@playwright/test').Locator, count: number) {
  return path.evaluate((element: SVGPathElement, count: number) => {
    const matrix = element.getScreenCTM()!;
    const length = element.getTotalLength();
    return Array.from({ length: count }, (_, i) => {
      const point = element.getPointAtLength((length * i) / (count - 1)).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
  }, count);
}

test('an edge routes around the nodes between its ends and keeps clear of them while one is dragged', async ({
  page,
}) => {
  await page.goto('/packages/routing');

  const flow = page.locator('vflow').first();
  await expect(flow.locator('[data-v-node]')).toHaveCount(7);
  const path = flow.locator('svg[edge]').first().locator('path').first();
  const nodeA = flow.locator('[data-v-node="a"]');
  const nodeB = flow.locator('[data-v-node="b"]');

  const clearOf = async (node: import('@playwright/test').Locator) => {
    const box = (await node.boundingBox())!;
    const points = await samples(path, 200);
    return points.every(
      (point) =>
        point.x <= box.x + 1 ||
        point.x >= box.x + box.width - 1 ||
        point.y <= box.y + 1 ||
        point.y >= box.y + box.height - 1,
    );
  };

  await expect.poll(() => clearOf(nodeA)).toBe(true);
  await expect.poll(() => clearOf(nodeB)).toBe(true);
  const before = await path.getAttribute('d');

  // Move A up into the corridor the route runs through: the route changes and still clears both nodes.
  const box = (await nodeA.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 60, { steps: 6 });
  await expect.poll(() => path.getAttribute('d')).not.toBe(before);
  await expect.poll(() => clearOf(nodeA)).toBe(true);
  await page.mouse.up();
  await expect.poll(() => clearOf(nodeA)).toBe(true);
  await expect.poll(() => clearOf(nodeB)).toBe(true);
});
