import { expect, test } from '@playwright/test';

test('overview resize node keeps its right handle on the node boundary', async ({ page }) => {
  await page.goto('/introduction/overview');
  const node = page.locator('.transform-node');
  await expect(node).toBeVisible();
  const error = () =>
    node.evaluate((element) => {
      const node = element.getBoundingClientRect();
      const handle = element.querySelector('.handle--right')!.getBoundingClientRect();
      return Math.abs(node.right - handle.left - handle.width / 2);
    });
  const outgoingEndpoints = () =>
    node.evaluate((element) => {
      const handle = element.querySelector('.handle--right')!.getBoundingClientRect();
      return Array.from(element.closest('vflow')!.querySelectorAll<SVGPathElement>('svg[edge] path.edge')).filter(
        (path) => {
          const start = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
          return Math.abs(start.x - handle.right) < 1 && Math.abs(start.y - handle.top - handle.height / 2) < 1;
        },
      ).length;
    });
  await expect.poll(error).toBeLessThan(1);
  await expect.poll(outgoingEndpoints).toBe(4);
  await node.locator('.title').click();
  await expect.poll(error).toBeLessThan(1);

  const wrapper = page.locator('.vflow-node').filter({ has: node });
  const corner = wrapper.locator('.resize-control.handle.bottom.right');
  const before = (await node.boundingBox())!;
  const grip = (await corner.boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2 + 60, grip.y + grip.height / 2 + 40, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await node.boundingBox())!.width).toBeGreaterThan(before.width + 40);
  await expect.poll(error).toBeLessThan(1);
  await expect.poll(outgoingEndpoints).toBe(4);

  // CSS constraints may change without a graph-state change or a resize gesture.
  const resized = (await node.boundingBox())!;
  await node.evaluate((element) => {
    const surface = element as HTMLElement;
    surface.style.minWidth = `${surface.offsetWidth + 100}px`;
    surface.style.minHeight = `${surface.offsetHeight + 60}px`;
  });
  await expect.poll(async () => (await node.boundingBox())!.width).toBeGreaterThan(resized.width + 20);
  await expect.poll(error).toBeLessThan(1);
  await expect.poll(outgoingEndpoints).toBe(4);
});
