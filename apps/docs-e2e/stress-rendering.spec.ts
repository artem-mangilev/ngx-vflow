import { expect, test } from '@playwright/test';

test('virtualization demo retains node DOM and geometry through viewport pan', async ({ page }) => {
  await page.goto('/performance/virtualization');
  const nodes = page.locator('.vflow-node');
  await expect(nodes).toHaveCount(4900);
  await expect(nodes.first()).toHaveCSS('visibility', 'visible');
  await page.locator('.vflow-pane').scrollIntoViewIfNeeded();
  const first = await nodes.first().elementHandle();
  const handleTop = await first!.evaluate((node) => node.querySelector<HTMLElement>('.handle--right')!.style.top);
  await expect
    .poll(() => nodes.evaluateAll((items) => items.filter((node) => getComputedStyle(node).display === 'none').length))
    .toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  const box = (await nodes.first().boundingBox())!;
  // Start between rows, clear of both nodes and edge interaction strokes.
  const start = { x: box.x + box.width + 10, y: box.y + box.height + 25 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 450, start.y, { steps: 12 });
  await page.mouse.up();
  await expect(nodes.first()).toHaveCSS('display', 'none');
  expect(await first!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await first!.evaluate((node) => node.querySelector<HTMLElement>('.handle--right')!.style.top)).toBe(handleTop);
  const pane = (await page.locator('.vflow-pane').boundingBox())!;
  // Return via a gap between columns in the translated graph.
  const back = { x: pane.x + 125, y: pane.y + box.height + 25 };
  await page.mouse.move(back.x, back.y);
  await page.mouse.down();
  await page.mouse.move(back.x + 450, back.y, { steps: 12 });
  await page.mouse.up();
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
        const visibleEdges = Array.from(document.querySelectorAll('svg[edge] .vui-edge')).filter(
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
  await expect(page.getByRole('checkbox', { name: 'Enable virtualization' })).toHaveCount(0);
  expect(
    await page
      .locator('.vflow-node')
      .evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display === 'none').length),
  ).toBe(0);
  await expect(page.locator('.stress-node')).toHaveCount(1024);
  await expect(page.locator('default-node')).toHaveCount(0);
  await expect(page.locator('svg[edge] .vui-edge')).toHaveCount(1023);
  expect(samples.at(-1).visibleEdges).toBe(1023);
});
