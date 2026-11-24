import { expect, test } from '@playwright/test';

test('virtualization demo retains node DOM and geometry through viewport pan', async ({ page }) => {
  await page.goto('/docs/performance/virtualization');
  const nodes = page.locator('[data-v-node]');
  await expect(nodes).toHaveCount(10000, { timeout: 30_000 });
  await page.locator('.v-pane').scrollIntoViewIfNeeded();
  await expect
    .poll(() => nodes.evaluateAll((items) => items.filter((node) => getComputedStyle(node).display === 'none').length))
    .toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  // The demo opens on the middle of the graph: the node under test is the first one that lies whole in the pane.
  const id = await page.locator('vflow').evaluate((flow) => {
    const pane = flow.querySelector('.v-pane')!.getBoundingClientRect();
    const inside = Array.from(flow.querySelectorAll<HTMLElement>('[data-v-node]')).find((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.left >= pane.left && rect.top >= pane.top;
    });
    return inside!.getAttribute('data-v-node');
  });
  const node = page.locator(`[data-v-node="${id}"]`);
  await expect(node).toHaveCSS('visibility', 'visible');
  const handle = await node.elementHandle();
  const handleTop = await handle!.evaluate(
    (element) => element.querySelector<HTMLElement>('[data-v-handle][data-v-handle-position="right"]')!.style.top,
  );
  const box = (await node.boundingBox())!;
  const pane = (await page.locator('.v-pane').boundingBox())!;
  // Rows are a node height apart and no edge joins two rows, so the middle of the gap under the node is free canvas.
  const start = { x: pane.x + pane.width / 2, y: box.y + box.height * 1.5 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 450, start.y, { steps: 12 });
  await page.mouse.up();
  await expect(node).toHaveCSS('display', 'none');
  expect(await handle!.evaluate((element) => element.isConnected)).toBe(true);
  expect(
    await handle!.evaluate(
      (element) => element.querySelector<HTMLElement>('[data-v-handle][data-v-handle-position="right"]')!.style.top,
    ),
  ).toBe(handleTop);
  // The pan was horizontal, so the same gap is still under the pointer.
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 450, start.y, { steps: 12 });
  await page.mouse.up();
  await expect(node).not.toHaveCSS('display', 'none');
  await expect(node).toHaveCSS('visibility', 'visible');
  expect(await handle!.evaluate((element) => element.isConnected)).toBe(true);
});

test('stress demo reveals custom nodes and edges with positioned handles', async ({ page }) => {
  await page.addInitScript(() => {
    const samples: { hidden: number; visibleEdges: number; misplaced: string[] }[] = [];
    Object.assign(window, { stressRenderingSamples: samples });
    const sample = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-v-node]'));
      if (nodes.length) {
        const hidden = nodes.filter((node) => getComputedStyle(node).visibility === 'hidden').length;
        const misplaced: string[] = [];
        for (const node of nodes) {
          if (getComputedStyle(node).visibility !== 'visible') continue;
          const anchor = node.querySelector('[data-testid="stress-node"]')?.getBoundingClientRect();
          if (!anchor) continue;
          for (const handle of node.querySelectorAll<HTMLElement>('[data-v-handle]')) {
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
  await page.goto('/examples/recipes/stress-test');
  await page.waitForFunction(() => (window as any).stressRenderingSamples.length === 8);
  const samples = await page.evaluate(() => (window as any).stressRenderingSamples);
  expect(samples.flatMap((sample: { misplaced: string[] }) => sample.misplaced)).toEqual([]);
  expect(
    samples.filter(
      (sample: { hidden: number; visibleEdges: number }) => sample.hidden === 2000 && sample.visibleEdges > 0,
    ),
  ).toEqual([]);
  await expect(page.getByRole('checkbox', { name: 'Enable virtualization' })).toHaveCount(0);
  expect(
    await page
      .locator('[data-v-node]')
      .evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display === 'none').length),
  ).toBe(0);
  await expect(page.getByTestId('stress-node')).toHaveCount(2000);
  await expect(page.locator('default-node')).toHaveCount(0);
  await expect(page.locator('svg[edge] .vui-edge')).toHaveCount(1999);
  expect(samples.at(-1).visibleEdges).toBe(1999);
});
