import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('built package consumption and theme isolation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const core = page.locator('core-scene');
  await expect(core.locator('.vflow-node')).toHaveCount(2);
  await expect(core.locator('.vflow-root')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  if (process.env['UI_CSS_MODE'] !== 'core') {
    const editors = page.locator('section[data-vui-theme]');
    const light = editors.nth(0);
    const dark = editors.nth(1);
    const markerScopes = await editors.evaluateAll((sections) =>
      sections.map((section) => {
        const edge = section.querySelector('path.vui-edge')!;
        const id = edge.getAttribute('marker-end')!.slice(5, -1);
        return { id, local: !!section.querySelector(`[id="${id}"]`) };
      }),
    );
    expect(markerScopes.every((marker) => marker.local)).toBe(true);
    expect(new Set(markerScopes.map((marker) => marker.id)).size).toBe(2);
    await expect(light.locator('article').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(dark.locator('article').first()).toHaveCSS('background-color', 'rgb(27, 40, 59)');
    await expect(light.locator('.vui-bpmn-event')).toHaveCount(2);
    await expect(light.getByRole('button', { name: 'Custom action' })).toHaveCSS(
      'background-color',
      'rgb(0, 119, 119)',
    );
    const canvas = light.locator('canvas');
    const bitmap = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
    const nodeBox = await light.locator('article').first().boundingBox();
    await page.getByRole('button', { name: 'Toggle first theme' }).click();
    await expect(light.locator('article').first()).toHaveCSS('background-color', 'rgb(27, 40, 59)');
    await expect(light.locator('.vui-toolbar').first()).toHaveCSS('background-color', 'rgb(27, 40, 59)');
    await expect(light.locator('marker polyline').first()).toHaveCSS('fill', 'rgb(175, 190, 209)');
    await expect.poll(() => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(bitmap);
    expect(await light.locator('article').first().boundingBox()).toEqual(nodeBox);
    await expect(core.locator('.vflow-root')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(light.getByRole('button', { name: 'Custom action' })).toHaveCSS(
      'background-color',
      'rgb(0, 119, 119)',
    );
  }
  const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('core-only selection survives blur and resized endpoints follow custom content', async ({ page }) => {
  await page.goto('/');
  const core = page.locator('core-scene');
  const source = core.locator('.vflow-node').first();
  await source.getByText('Own source', { exact: true }).click();
  await expect(source).toHaveClass(/vflow-node-selected/);
  await source.evaluate((el) => (el as HTMLElement).blur());
  await expect(source).toHaveCSS('outline-color', 'rgb(15, 76, 117)');
  await expect(source).toHaveCSS('outline-style', 'solid');
  const before = (await source.boundingBox())!;
  const corner = (await source.locator('.vflow-resize-handle.bottom.right').boundingBox())!;
  await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2);
  await page.mouse.down();
  await page.mouse.move(corner.x + corner.width / 2 + 40, corner.y + corner.height / 2 + 20, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await source.boundingBox())!.width).toBeGreaterThan(before.width + 30);
  await expect
    .poll(() =>
      core.evaluate((root) => {
        const edge = root.querySelector<SVGPathElement>('g[customTemplateEdge] path')!;
        const source = root.querySelector('.vflow-node handle .handle--right')!.getBoundingClientRect();
        const target = root
          .querySelectorAll('.vflow-node')[1]
          .querySelector('handle .handle--left')!
          .getBoundingClientRect();
        const matrix = edge.getScreenCTM()!;
        const start = edge.getPointAtLength(0).matrixTransform(matrix);
        const end = edge.getPointAtLength(edge.getTotalLength()).matrixTransform(matrix);
        return Math.max(
          Math.abs(start.x - source.right),
          Math.abs(start.y - source.y - source.height / 2),
          Math.abs(end.x - target.left),
          Math.abs(end.y - target.y - target.height / 2),
        );
      }),
    )
    .toBeLessThan(1);
});
