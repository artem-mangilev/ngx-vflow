import { expect, Locator, test } from '@playwright/test';

async function rowAlignment(demo: Locator) {
  return demo.locator('[vflowField]').evaluateAll((rows) =>
    Math.max(
      ...rows.flatMap((row) => {
        const rect = row.getBoundingClientRect();
        return Array.from(row.querySelectorAll('.vui-port')).map((port) => {
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
  await expect(review.locator('.vui-status:not([title])')).toHaveText('Waiting');
  const activity = review.locator('[data-active=true]');
  await expect.poll(() => activity.evaluate((el) => getComputedStyle(el, '::before').animationName)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => activity.evaluate((el) => getComputedStyle(el, '::before').animationName)).toBe('none');
  await expect(workflow.locator('node-toolbar')).toBeAttached();
  await workflow.getByLabel('Read only', { exact: true }).check();
  const approve = review.getByRole('button', { name: 'Approve', exact: true });
  await expect(approve).toBeDisabled();
  await workflow.getByLabel('Read only', { exact: true }).uncheck();
  await expect(approve).toBeEnabled();
  await approve.focus();
  await expect(approve).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(review.locator('.vui-status:not([title])')).toHaveText('Approved');
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
        .querySelector('[data-entity="crm"] [data-field="email"] .handle--right .vui-port')!
        .getBoundingClientRect();
      const target = root
        .querySelector('[data-entity="erp"] [data-field="email"] .handle--left .vui-port')!
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
  await demo.locator('section').evaluate((el) => el.style.setProperty('--vui-font-size', '18px'));
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  await expect.poll(endpointError).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Remove Copy email connection', exact: true }).click();
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  const source = demo.locator('[data-entity="crm"] [data-field="email"] .handle.handle--right');
  const target = demo.locator('[data-entity="erp"] [data-field="email"] .handle.handle--left');
  // Core intentionally overlays the target with its magnetic hit area during a connection.
  // Move the pointer through that real surface instead of asking locator.dragTo to bypass it.
  await source.scrollIntoViewIfNeeded();
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  const invalid = demo.locator('[data-entity=order] [data-field=id] .handle--left');
  const bad = (await invalid.boundingBox())!;
  await page.mouse.move(bad.x + bad.width / 2, bad.y + bad.height / 2, { steps: 12 });
  await expect(invalid.locator('.vui-port')).toHaveAttribute('data-state', 'invalid');
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
  await expect(demo.locator('.vui-group')).toHaveCount(3);
  await expect(demo.locator('.vui-bpmn-event')).toHaveCount(2);
  await expect(demo.locator('path.vui-edge')).toHaveCount(9);
  await expect(demo.locator('[data-event="end"]')).toHaveCSS('border-top-width', '5px');
  const gateway = demo.locator('.vui-bpmn-gateway').first();
  await gateway.click();
  await expect(gateway).toHaveAttribute('data-vui-selected', 'true');
  await expect(gateway).toHaveCSS('transform', 'none');
  await demo.getByLabel('Dark theme', { exact: true }).check();
  await expect(demo.locator('[data-event="start"]')).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await demo.screenshot({ path: testInfo.outputPath('bpmn.png') });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(demo.locator('path.vui-edge').first()).toHaveCSS('stroke', 'rgb(0, 0, 0)');
});

test('viewport controls use the selected flow and honor its zoom limits', async ({ page }) => {
  await page.goto('/design-system/workflow');
  const demo = page.locator('app-ui-workflow-demo');
  const zoomIn = demo.getByRole('button', { name: 'Zoom in', exact: true });
  const zoomOut = demo.getByRole('button', { name: 'Zoom out', exact: true });
  for (let i = 0; i < 12 && !(await zoomIn.isDisabled()); i++) {
    const before = await demo.getByLabel('Zoom level', { exact: true }).textContent();
    await zoomIn.click();
    await expect(demo.getByLabel('Zoom level', { exact: true })).not.toHaveText(before!);
  }
  await expect(zoomIn).toBeDisabled();
  await expect(zoomOut).toBeEnabled();
  for (let i = 0; i < 16 && !(await zoomOut.isDisabled()); i++) {
    const before = await demo.getByLabel('Zoom level', { exact: true }).textContent();
    await zoomOut.click();
    await expect(demo.getByLabel('Zoom level', { exact: true })).not.toHaveText(before!);
  }
  await expect(zoomOut).toBeDisabled();
  await demo.getByRole('button', { name: 'Fit view', exact: true }).click();
  await expect(zoomIn).toBeEnabled();
});

test('editor theme updates minimap pixels without moving nodes', async ({ page }) => {
  await page.goto('/design-system/workflow');
  const demo = page.locator('app-ui-workflow-demo');
  const canvas = demo.locator('canvas');
  await expect(canvas).toBeVisible();
  const pixels = () => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const before = await pixels();
  const box = await demo.locator('article').first().boundingBox();
  await demo.getByLabel('Dark theme', { exact: true }).check();
  await expect.poll(pixels).not.toBe(before);
  expect(await demo.locator('article').first().boundingBox()).toEqual(box);
});

test('media controls preserve node position and typed port geometry', async ({ page }) => {
  await page.goto('/design-system/pipeline');
  const demo = page.locator('app-ui-pipeline-demo');
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  const node = demo.locator('article').filter({ hasText: 'Resize image' });
  const before = await node.boundingBox();
  await node.getByRole('slider', { name: 'Output width' }).fill('640');
  await expect(node.getByRole('status')).toHaveText('640 px');
  expect(await node.boundingBox()).toEqual(before);
});

test('field experiment retains graph identity through collapse and explicitly deletes incident edges', async ({
  page,
}, testInfo) => {
  await page.goto('/design-system/entities');
  const demo = page.locator('app-ui-entities-demo');
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  const ids = () =>
    demo.locator('[data-field]').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-field')));
  const before = await ids();
  await demo.getByLabel('Scroll experiment', { exact: true }).check();
  const measurements: { zoom: string | null; error: number }[] = [];
  for (let i = 0; i < 3; i++) {
    await demo
      .locator('.fields')
      .first()
      .evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
    measurements.push({
      zoom: await demo.getByLabel('Zoom level', { exact: true }).textContent(),
      error: await rowAlignment(demo),
    });
    await demo.getByRole('button', { name: 'Zoom in', exact: true }).click();
  }
  await demo.getByLabel('Collapse fields', { exact: true }).check();
  expect(await ids()).toEqual(before);
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await demo.getByLabel('Collapse fields', { exact: true }).uncheck();
  await demo.getByLabel('Scroll experiment', { exact: true }).uncheck();
  measurements.push({ zoom: 'expanded', error: await rowAlignment(demo) });
  expect(await ids()).toEqual(before);
  await demo.getByRole('button', { name: 'Delete CRM email', exact: true }).click();
  await expect(demo.locator('[data-entity="crm"] [data-field="email"]')).toHaveCount(0);
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  await testInfo.attach('scroll-measurements', { body: JSON.stringify(measurements), contentType: 'application/json' });
});

test('relationships frame connects independently and viewing keeps nodes stationary', async ({ page }) => {
  await page.goto('/design-system/relationships');
  const demo = page.locator('app-ui-relationships-demo');
  await expect(demo.locator('.vui-group')).toHaveCount(1);
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  await expect(demo.locator('article').filter({ hasText: 'About these metrics' }).locator('handle')).toHaveCount(0);
  const metric = demo.locator('article').filter({ hasText: 'Requests' });
  const box = (await metric.boundingBox())!;
  const frame = (await demo.locator('.vui-group').boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 50, { steps: 8 });
  await page.mouse.up();
  const after = (await metric.boundingBox())!;
  const frameAfter = (await demo.locator('.vui-group').boundingBox())!;
  expect(after.x - frameAfter.x).toBeCloseTo(box.x - frame.x, 2);
  expect(after.y - frameAfter.y).toBeCloseTo(box.y - frame.y, 2);
});
