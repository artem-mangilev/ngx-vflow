import { expect, Locator, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function rowAlignment(demo: Locator) {
  return demo.locator('[vflowField]').evaluateAll((rows) =>
    Math.max(
      ...rows.flatMap((row) => {
        const rect = row.getBoundingClientRect();
        const ports = row.closest('[data-entity]')
          ? row
              .closest('[data-entity]')!
              .querySelectorAll(`[data-port-field="${row.getAttribute('data-field')}"] .vui-port`)
          : row.querySelectorAll('.vui-port');
        return Array.from(ports).map((port) => {
          const handle = port.getBoundingClientRect();
          return Math.abs(rect.y + rect.height / 2 - handle.y - handle.height / 2);
        });
      }),
    ),
  );
}

test('consumer DOM, scoped themes, selection and native workflow actions', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/design-system/workflow');
  const workflow = page.locator('app-ui-workflow-demo');
  await expect(workflow.locator('article.vui-node')).toHaveCount(4);
  await expect(workflow.locator('path.vui-edge')).toHaveCount(3);
  await expect(workflow.locator('article.vui-node').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  // Directives add classes to the consumer article/header, without injecting wrapper elements.
  await expect(workflow.locator('article > header.vui-node-header')).toHaveCount(4);
  const review = workflow.locator('article').filter({ hasText: 'Finance review' });
  await review.locator('header').click();
  await expect(review).toHaveAttribute('data-vui-selected', 'true');
  await expect(review.locator('footer .vui-status')).toHaveText('Waiting');
  await expect(review.locator('.description .vui-status')).toHaveText('Missing purchase order');
  await expect(workflow.locator('node-toolbar')).toBeAttached();
  await workflow.getByLabel('Read only', { exact: true }).check();
  const approve = review.getByRole('button', { name: 'Approve', exact: true });
  await expect(approve).toBeDisabled();
  await workflow.getByLabel('Read only', { exact: true }).uncheck();
  await expect(approve).toBeEnabled();
  await approve.focus();
  await expect(approve).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(review.locator('footer .vui-status')).toHaveText('Approved');
  await expect(review.locator('.description .vui-status')).toHaveText('Missing purchase order');
  await expect(approve).toBeDisabled();
  await expect(review).toHaveAttribute('data-vui-selected', 'true');
  await workflow.getByLabel('Dark theme', { exact: true }).check();
  await expect(review).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await expect(workflow.locator('.vflow-toolbar .vui-toolbar')).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await expect(workflow.locator('path.vui-edge').first()).toHaveCSS('stroke', 'rgb(175, 190, 209)');
  await expect(workflow.locator('marker polyline').first()).toHaveCSS('fill', 'rgb(175, 190, 209)');
  await workflow.screenshot({ path: testInfo.outputPath('workflow.png') });
  expect(errors).toEqual([]);
});

test('field connections follow stable IDs through rename, reorder, density and recreation', async ({
  page,
}, testInfo) => {
  await page.goto('/design-system/entities');
  const demo = page.locator('app-ui-entities-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('article')).toHaveCount(4);
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Rename email', exact: true }).click();
  await expect(demo.locator('[data-entity="crm"] [data-field="email"]')).toContainText('primary_email');
  await demo.getByRole('button', { name: 'Reverse fields', exact: true }).click();
  await expect(demo.locator('[data-entity="crm"] [vflowField]').first()).toHaveAttribute('data-field', 'name');
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  await demo.getByLabel('Compact', { exact: true }).check();
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);

  // The actual SVG endpoints must meet the outer rim of their original field ports.
  const endpointError = () =>
    demo.evaluate((root) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[1];
      const source = root
        .querySelector('[data-entity="crm"] [data-port-field="email"] .handle--right .vui-port')!
        .getBoundingClientRect();
      const target = root
        .querySelector('[data-entity="erp"] [data-port-field="email"] .handle--left .vui-port')!
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
    });
  await expect.poll(endpointError).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Remove Copy email connection', exact: true }).click();
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  const source = demo.locator('[data-entity="crm"] [data-port-field="email"] .handle.handle--right');
  const target = demo.locator('[data-entity="erp"] [data-port-field="email"] .handle.handle--left');
  // Core intentionally overlays the target with its magnetic hit area during a connection.
  // Move the pointer through that real surface instead of asking locator.dragTo to bypass it.
  await source.scrollIntoViewIfNeeded();
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await expect(target.locator('.vui-port')).toHaveAttribute('data-state', 'valid');
  await page.mouse.up();
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect(demo.getByRole('button', { name: 'Remove Mapping connection', exact: true })).toBeVisible();
  await expect.poll(endpointError).toBeLessThan(1);
  await demo.screenshot({ path: testInfo.outputPath('entities.png') });
});

test('BPMN outlines, lane frames and core selection render in both themes', async ({ page }, testInfo) => {
  await page.goto('/design-system/bpmn');
  const demo = page.locator('app-ui-bpmn-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('.vui-bpmn-lane')).toHaveCount(2);
  await expect(demo.locator('.vui-bpmn-pool')).toHaveCount(2);
  await expect(demo.locator('[data-link="message"]')).toHaveCSS('stroke-dasharray', '8px, 5px');
  await expect(demo.locator('[data-link="association"]')).toHaveCSS('stroke-dasharray', '2px, 5px');
  await expect(demo.locator('.vui-bpmn-event')).toHaveCount(2);
  await expect(demo.locator('path.vui-edge')).toHaveCount(9);
  await expect(demo.locator('[data-gateway="parallel"]')).toContainText('+');
  await expect(demo.locator('[data-event="end"]')).toHaveCSS('border-top-width', '5px');
  const sequence = demo.locator('path[data-link="sequence"]').first();
  const midpoint = await sequence.evaluate((path: SVGPathElement) => {
    const point = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!);
    return { x: point.x, y: point.y };
  });
  await page.mouse.click(midpoint.x, midpoint.y);
  await expect(sequence).toHaveAttribute('data-vui-selected', 'true');
  const gateway = demo.locator('[data-gateway="xor"]');
  await gateway.click();
  await expect(gateway).toHaveAttribute('data-vui-selected', 'true');
  await expect(gateway).toHaveCSS('transform', 'none');
  await demo.getByLabel('Dark theme', { exact: true }).check();
  await expect(demo.locator('[data-event="start"]')).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await demo.screenshot({ path: testInfo.outputPath('bpmn.png') });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(demo.locator('path.vui-edge').first()).toHaveCSS('stroke', 'rgb(0, 0, 0)');
});

test('pipeline handles stay aligned with their rows at every zoom', async ({ page }) => {
  await page.goto('/design-system/pipeline');
  const demo = page.locator('app-ui-pipeline-demo');
  const rows = demo.locator('[data-port]');
  await expect(rows).toHaveCount(5);
  const alignment = () =>
    rows.evaluateAll((rows) =>
      Math.max(
        ...rows.map((row) => {
          const anchor = row.getBoundingClientRect();
          const handle = row.querySelector('.handle')!.getBoundingClientRect();
          return Math.abs(anchor.y + anchor.height / 2 - handle.y - handle.height / 2);
        }),
      ),
    );
  await expect.poll(alignment).toBeLessThan(1);
  for (const name of ['Zoom in', 'Zoom out']) {
    const button = demo.getByRole('button', { name, exact: true });
    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      if (await button.isDisabled()) break;
      await button.click();
      await expect.poll(alignment).toBeLessThan(1);
    }
    await expect(button).toBeDisabled();
  }
  await demo.getByLabel('Dark theme', { exact: true }).check();
  await expect.poll(alignment).toBeLessThan(1);
  await demo.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(alignment).toBeLessThan(1);
});

test('pipeline native controls do not drag nodes and viewport controls enforce zoom limits', async ({ page }) => {
  await page.goto('/design-system/pipeline');
  const demo = page.locator('app-ui-pipeline-demo');
  await expect(demo.locator('article')).toHaveCount(3);
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect(demo.locator('.vui-port-label')).toHaveCount(5);
  const node = demo.locator('[data-node="resize"]');
  // Focusing a native control may scroll the document, not move the graph node.
  const canvasPosition = () =>
    node.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const canvas = element.closest('vflow')!.getBoundingClientRect();
      return { x: rect.x - canvas.x, y: rect.y - canvas.y };
    });
  const before = await canvasPosition();
  await demo.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await expect(demo.getByRole('slider')).toHaveValue('800');
  const after = await canvasPosition();
  expect(after.x).toBeCloseTo(before.x, 2);
  expect(after.y).toBeCloseTo(before.y, 2);
  await demo.getByRole('button', { name: 'Export preview', exact: true }).click();
  await expect(demo.locator('p[aria-live="polite"]')).toHaveText('Exports: 1');
  const zoomIn = demo.getByRole('button', { name: 'Zoom in', exact: true });
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await zoomIn.isDisabled()) break;
    await zoomIn.click();
  }
  await expect(zoomIn).toBeDisabled();
  const zoomOut = demo.getByRole('button', { name: 'Zoom out', exact: true });
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await zoomOut.isDisabled()) break;
    await zoomOut.click();
  }
  await expect(zoomOut).toBeDisabled();
  await demo.getByRole('button', { name: 'Fit view', exact: true }).click();
  await expect(zoomIn).toBeEnabled();
});

test('container connections and view-only metrics coexist with notes and themed minimap', async ({ page }) => {
  await page.goto('/design-system/relationships');
  const demo = page.locator('app-ui-relationships-demo');
  await expect(demo.locator('.vui-group')).toHaveCount(1);
  await expect(demo.locator('.note .handle')).toHaveCount(0);
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  const frame = demo.locator('.frame');
  // Dragging a non-draggable node may pan the camera; the node's flow-space transform must not change.
  const wrapper = frame.locator('..');
  const before = await wrapper.getAttribute('style');
  await frame.locator('header').dragTo(demo.locator('.note'));
  expect(await wrapper.getAttribute('style')).toEqual(before);
  await demo.getByRole('button', { name: 'Refresh metrics', exact: true }).click();
  await expect(demo.locator('.metric').first()).toHaveText('42 ms');
  const canvas = demo.locator('canvas');
  const bitmap = () => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const dark = await bitmap();
  await demo.getByLabel('Dark theme', { exact: true }).uncheck();
  await expect.poll(bitmap).not.toBe(dark);
  expect(await wrapper.getAttribute('style')).toEqual(before);
});

test('themes and marker IDs are isolated per editor; colors do not change geometry', async ({ page }) => {
  await page.goto('/introduction/design-system');
  await expect(page).toHaveURL(/\/design-system\/overview$/);
  const demo = page.locator('app-ui-themes-demo');
  const light = demo.locator('[data-editor="light"]');
  const dark = demo.locator('[data-editor="dark"]');
  const core = demo.locator('[data-editor="core-only"]');
  await expect(light.locator('.custom-node').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(dark.locator('.custom-node').first()).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await expect(core.locator('.custom-node').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  const markerIds = await demo.locator('marker').evaluateAll((markers) => markers.map((marker) => marker.id));
  expect(new Set(markerIds).size).toBe(3);
  const paths = await demo.locator('.custom-edge').evaluateAll((paths) => paths.map((path) => path.getAttribute('d')));
  const bitmaps = () =>
    demo.locator('canvas').evaluateAll((canvases) => canvases.map((c) => (c as HTMLCanvasElement).toDataURL()));
  const before = await bitmaps();
  await demo.getByRole('button', { name: 'Swap editor themes' }).click();
  await expect(light.locator('marker polyline')).toHaveCSS('fill', 'rgb(175, 190, 209)');
  await expect(dark.locator('marker polyline')).toHaveCSS('fill', 'rgb(86, 101, 121)');
  await expect(core.locator('marker polyline')).toHaveCSS('fill', 'rgb(177, 177, 183)');
  await expect.poll(async () => (await bitmaps())[0]).not.toBe(before[0]);
  const after = await bitmaps();
  expect(after[2]).toBe(before[2]);
  expect(
    await demo.locator('.custom-edge').evaluateAll((paths) => paths.map((path) => path.getAttribute('d'))),
  ).toEqual(paths);
  const darkZoom = await dark.locator('.vflow-viewport').getAttribute('style');
  await light.getByRole('button', { name: 'Zoom out', exact: true }).click();
  expect(await dark.locator('.vflow-viewport').getAttribute('style')).toBe(darkZoom);

  const canvas = light.locator('canvas');
  const beforeStylesheet = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.addStyleTag({ content: '[data-editor="light"] { --vflow-surface: #ff00ff; }' });
  await light.getByRole('button', { name: 'Refresh canvas colors', exact: true }).click();
  await expect.poll(() => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(beforeStylesheet);
});

test('a color-only theme switch does not remeasure node or handle DOM', async ({ page }) => {
  await page.goto('/design-system/overview');
  const demo = page.locator('app-ui-themes-demo');
  await expect(demo.locator('.vflow-node')).toHaveCount(6);
  const reads = await demo.evaluate(async (root) => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    for (let i = 0; i < 4; i++) await frame();
    const original = Element.prototype.getBoundingClientRect;
    const reads: string[] = [];
    Element.prototype.getBoundingClientRect = function () {
      if (root.contains(this) && this.matches('.vflow-node, handle, .custom-node')) reads.push(this.tagName);
      return original.call(this);
    };
    try {
      root.querySelector<HTMLButtonElement>('button')!.click();
      for (let i = 0; i < 6; i++) await frame();
      return reads;
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });
  expect(reads).toEqual([]);
});

test('field deletion explicitly removes incident edges; collapse preserves mounted IDs', async ({ page }) => {
  await page.goto('/design-system/entities');
  const demo = page.locator('app-ui-entities-demo');
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  const fields = await demo
    .locator('[data-field]')
    .evaluateAll((fields) => fields.map((field) => field.getAttribute('data-field')));
  await demo.getByLabel('Collapse fields', { exact: true }).check();
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  expect(
    await demo.locator('[data-field]').evaluateAll((fields) => fields.map((field) => field.getAttribute('data-field'))),
  ).toEqual(fields);
  await demo.getByLabel('Collapse fields', { exact: true }).uncheck();
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Delete CRM email field', exact: true }).click();
  await expect(demo.locator('[data-entity="crm"] [data-field="email"]')).toHaveCount(0);
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
});

test('activity respects reduced motion without disabling the business action', async ({ page }) => {
  await page.goto('/design-system/workflow');
  const active = page.locator('.vui-status[data-active="true"]');
  await expect(active).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeEnabled();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await active.evaluate((el) => getComputedStyle(el, '::before').animationName)).toBe('none');
});

for (const scene of ['workflow', 'entities', 'pipeline', 'relationships', 'bpmn']) {
  test(`${scene} composition has accessible native content in both themes`, async ({ page }) => {
    await page.goto(`/design-system/${scene}`);
    const selector = `app-ui-${scene}-demo`;
    const demo = page.locator(selector);
    await expect(demo.locator('.vflow-node').first()).toBeVisible();
    // NgDoc fades route content in. Audit the settled composition, not an intermediate opacity.
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getTiming().iterations))
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
    );
    for (const dark of [false, true]) {
      await demo.getByLabel('Dark theme', { exact: true }).setChecked(dark);
      expect((await new AxeBuilder({ page }).include(selector).analyze()).violations).toEqual([]);
    }
  });
}
