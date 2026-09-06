import { expect, test } from '@playwright/test';

test('stress virtualization retains node DOM and geometry through viewport pan', async ({ page }) => {
  await page.goto('/performance/stress-test');
  const nodes = page.locator('.vflow-node');
  await expect(nodes).toHaveCount(1024);
  await expect(nodes.first()).toHaveCSS('visibility', 'visible');
  const first = await nodes.first().elementHandle();
  const handleTop = await first!.evaluate((node) => node.querySelector<HTMLElement>('.handle--right')!.style.top);
  await page.getByRole('checkbox', { name: 'Enable virtualization' }).check();
  await expect(nodes).toHaveCount(1024);
  await expect
    .poll(() => nodes.evaluateAll((items) => items.filter((node) => getComputedStyle(node).display === 'none').length))
    .toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  const box = (await nodes.first().boundingBox())!;
  // The gap immediately to the right of the first card is the pan surface.
  const start = { x: box.x + box.width + 10, y: box.y + 20 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 450, start.y, { steps: 12 });
  await page.mouse.up();
  await expect(nodes.first()).toHaveCSS('display', 'none');
  expect(await first!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await first!.evaluate((node) => node.querySelector<HTMLElement>('.handle--right')!.style.top)).toBe(handleTop);
  await page.getByRole('checkbox', { name: 'Enable virtualization' }).uncheck();
  await expect(nodes.first()).not.toHaveCSS('display', 'none');
  await expect(nodes.first()).toHaveCSS('visibility', 'visible');
  expect(await first!.evaluate((node) => node.isConnected)).toBe(true);
});

test('stress demo reveals custom nodes and edges with positioned handles', async ({ page }) => {
  await page.addInitScript(() => {
    const samples: { hidden: number; visibleEdges: number; misplaced: string[] }[] = [];
    Object.assign(window, { stressRenderingSamples: samples });
    const sample = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.vflow-node'));
      if (nodes.length) {
        const hidden = nodes.filter((node) => getComputedStyle(node).visibility === 'hidden').length;
        const misplaced: string[] = [];
        for (const node of nodes) {
          if (getComputedStyle(node).visibility !== 'visible') continue;
          const anchor = node.querySelector('.stress-node')?.getBoundingClientRect();
          if (!anchor) continue;
          for (const handle of node.querySelectorAll<HTMLElement>('.handle')) {
            const rect = handle.getBoundingClientRect();
            if (Math.abs(rect.y + rect.height / 2 - anchor.y - anchor.height / 2) > 0.2) {
              misplaced.push(handle.style.top);
            }
          }
        }
        const visibleEdges = Array.from(document.querySelectorAll('svg[edge] .edge')).filter(
          (edge) => getComputedStyle(edge).visibility === 'visible' && edge.getAttribute('d'),
        ).length;
        samples.push({ hidden, visibleEdges, misplaced });
      }
      if (samples.length < 8) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto('/performance/stress-test');
  await page.waitForFunction(() => (window as any).stressRenderingSamples.length === 8);
  const samples = await page.evaluate(() => (window as any).stressRenderingSamples);
  expect(samples.flatMap((sample: { misplaced: string[] }) => sample.misplaced)).toEqual([]);
  expect(
    samples.filter(
      (sample: { hidden: number; visibleEdges: number }) => sample.hidden === 1024 && sample.visibleEdges > 0,
    ),
  ).toEqual([]);
  await expect(page.locator('.stress-node')).toHaveCount(1024);
  await expect(page.locator('default-node')).toHaveCount(0);
  await expect(page.locator('svg[edge] .edge')).toHaveCount(1023);
  expect(samples.at(-1).visibleEdges).toBe(1023);
});
