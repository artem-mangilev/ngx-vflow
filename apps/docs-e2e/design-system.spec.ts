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
  await expect(workflow.locator('.vflow-edge-labels-layer .vui-edge-label')).toHaveCount(4);
  await expect(workflow.locator('article.vui-node').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  // Directives add classes to the consumer article/header, without injecting wrapper elements.
  await expect(workflow.locator('article > header.vui-node-header')).toHaveCount(4);
  const review = workflow.locator('article').filter({ hasText: 'Finance review' });
  await review.locator('header').click();
  await expect(review).toHaveAttribute('data-vui-selected', 'true');
  // Selection, application status and a model diagnostic are visible at the same time.
  await expect(review.locator('.vui-status')).toHaveText(['Waiting', 'Above limit']);
  await expect(review.locator('.vui-status').nth(1)).toHaveAttribute('data-tone', 'warning');
  await expect(workflow.locator('.vflow-toolbar .vui-toolbar')).toBeAttached();
  await expect(workflow.getByRole('button', { name: 'Details of Finance review', exact: true })).toBeVisible();
  // Activity is presentation only: the busy node keeps its action enabled.
  const paid = workflow.locator('article').filter({ hasText: 'Schedule payment' });
  await expect(paid.locator('.vui-status')).toHaveAttribute('data-busy', 'true');
  const open = paid.getByRole('button', { name: 'Open Schedule payment', exact: true });
  await expect(open).toBeEnabled();
  await open.click();
  await expect(workflow.getByTestId('opened')).toHaveText('Opened: Schedule payment');
  await workflow.getByLabel('Read only', { exact: true }).check();
  const approve = review.getByRole('button', { name: 'Approve', exact: true });
  await expect(approve).toBeDisabled();
  await workflow.getByLabel('Read only', { exact: true }).uncheck();
  await expect(approve).toBeEnabled();
  await approve.focus();
  await expect(approve).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(review.locator('.vui-status').first()).toHaveText('Approved');
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
  await page.goto('/design-system/erd-schema-mapping');
  const demo = page.locator('app-ui-entities-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('article')).toHaveCount(4);
  // This page opts into the dark theme while the workflow page stays light.
  await expect(demo.locator('article.vui-node').first()).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect(demo.locator('.vui-port[data-connected="true"]')).toHaveCount(4);
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
  await demo.getByRole('button', { name: 'Remove Copy email connection', exact: true }).click();
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  await expect(demo.locator('.vui-port[data-connected="true"]')).toHaveCount(2);
  const source = demo.locator('[data-entity="crm"] [data-field="email"] .handle.handle--right');
  const target = demo.locator('[data-entity="erp"] [data-field="email"] .handle.handle--left');
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
  await expect(demo.locator('.vui-port[data-connected="true"]')).toHaveCount(4);
  await expect.poll(endpointError).toBeLessThan(1);
  await demo.screenshot({ path: testInfo.outputPath('entities.png') });
});

test('BPMN subset: pools with own message flows, lanes, gateways, flow kinds and themes', async ({
  page,
}, testInfo) => {
  await page.goto('/design-system/bpmn');
  const demo = page.locator('app-ui-bpmn-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('.vui-bpmn-pool')).toHaveCount(2);
  await expect(demo.locator('.vui-bpmn-lane')).toHaveCount(2);
  await expect(demo.locator('.vui-bpmn-task')).toHaveCount(4);
  await expect(demo.locator('.vui-bpmn-event')).toHaveCount(3);
  await expect(demo.locator('.vui-bpmn-gateway[data-gateway="exclusive"]')).toHaveCount(1);
  await expect(demo.locator('.vui-bpmn-gateway[data-gateway="parallel"]')).toHaveCount(1);
  await expect(demo.locator('.vui-external-label')).toHaveCount(5);
  await expect(demo.locator('path.vui-bpmn-flow[data-flow="sequence"]')).toHaveCount(9);
  await expect(demo.locator('path.vui-bpmn-flow[data-flow="message"]')).toHaveCount(2);
  await expect(demo.locator('path.vui-bpmn-flow[data-flow="association"]')).toHaveCount(1);
  await expect(demo.locator('path.vui-bpmn-flow[data-flow="message"]').first()).toHaveCSS(
    'stroke-dasharray',
    '8px, 5px',
  );
  await expect(demo.locator('[data-event="intermediate"]')).toHaveCSS('border-top-style', 'double');
  await expect(demo.locator('[data-event="end"]')).toHaveCSS('border-top-width', '5px');
  // The supplier pool is a container that takes part in flows through its own handles.
  const pool = demo.locator('.vui-bpmn-pool').first();
  await expect(pool.locator('.handle .vui-port')).toHaveCount(2);
  const messageEndpoint = () =>
    demo.evaluate((root) => {
      const edge = root.querySelector<SVGPathElement>('path.vui-bpmn-flow[data-flow="message"]')!;
      // The pool's second bottom handle is its message source; the first one receives messages.
      const source = root
        .querySelector('.vui-bpmn-pool')!
        .querySelectorAll('.handle--bottom .vui-port')[1]
        .getBoundingClientRect();
      const start = edge.getPointAtLength(0).matrixTransform(edge.getScreenCTM()!);
      return Math.max(Math.abs(start.x - source.x - source.width / 2), Math.abs(start.y - source.bottom));
    });
  await expect.poll(messageEndpoint).toBeLessThan(1.5);
  const gateway = demo.locator('.vui-bpmn-gateway').first();
  await gateway.click();
  await expect(gateway).toHaveAttribute('data-vui-selected', 'true');
  await expect(gateway).toHaveCSS('transform', 'none');
  await demo.getByLabel('Dark theme', { exact: true }).check();
  await expect(demo.locator('[data-event="start"]')).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await demo.screenshot({ path: testInfo.outputPath('bpmn.png') });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(demo.locator('path.vui-bpmn-flow').first()).toHaveCSS('stroke', 'rgb(0, 0, 0)');
});

test('viewport controls drive the given flow within its zoom limits, and edge labels follow geometry', async ({
  page,
}) => {
  await page.goto('/design-system/workflow');
  const workflow = page.locator('app-ui-workflow-demo');
  const controls = workflow.getByRole('group', { name: 'Viewport controls' });
  const zoomIn = controls.getByRole('button', { name: 'Zoom in', exact: true });
  const zoomOut = controls.getByRole('button', { name: 'Zoom out', exact: true });
  const zoom = () =>
    workflow.locator('.vflow-viewport').evaluate((element) => {
      const match = /scale\(([^)]+)\)/.exec(element.style.transform);
      return match ? Number(match[1]) : 1;
    });
  await expect(controls.getByRole('button', { name: 'Reset demo', exact: true })).toBeVisible();
  const initial = await zoom();
  await zoomIn.click();
  await expect.poll(zoom).toBeGreaterThan(initial);
  for (let index = 0; index < 8 && (await zoom()) < 2 - 1e-6; index += 1) {
    const previous = await zoom();
    await zoomIn.click();
    await expect.poll(zoom).toBeGreaterThan(previous);
  }
  await expect.poll(zoom).toBeCloseTo(2, 5);
  await expect(zoomIn).toBeDisabled();
  await controls.getByRole('button', { name: 'Fit view', exact: true }).click();
  await expect(zoomIn).toBeEnabled();
  for (let index = 0; index < 8 && (await zoom()) > 0.5 + 1e-6; index += 1) {
    const previous = await zoom();
    await zoomOut.click();
    await expect.poll(zoom).toBeLessThan(previous);
  }
  await expect.poll(zoom).toBeCloseTo(0.5, 5);
  await expect(zoomOut).toBeDisabled();
  await controls.getByRole('button', { name: 'Fit view', exact: true }).click();
  await expect(zoomOut).toBeEnabled();

  // Start, center and end labels of one edge sit on its path and move with the target node.
  const labels = ['review', 'Approved', 'accounting'];
  const labelDistance = () =>
    workflow.evaluate((root, names) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[1];
      const matrix = edge.getScreenCTM()!;
      const total = edge.getTotalLength();
      return names.map((name) => {
        const rect = root.querySelector(`[data-label="${name}"]`)!.getBoundingClientRect();
        const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        let best = Infinity;
        for (let length = 0; length <= total; length += 2) {
          const point = edge.getPointAtLength(length).matrixTransform(matrix);
          best = Math.min(best, Math.hypot(point.x - center.x, point.y - center.y));
        }
        return { name, best, x: center.x, y: center.y };
      });
    }, labels);
  // Fit view animates; wait for the camera to settle before dragging in screen coordinates.
  const viewportTransform = () => workflow.locator('.vflow-viewport').evaluate((element) => element.style.transform);
  await expect
    .poll(async () => {
      const first = await viewportTransform();
      await page.waitForTimeout(150);
      return first === (await viewportTransform());
    })
    .toBe(true);
  const before = await labelDistance();
  for (const label of before) expect(label.best, label.name).toBeLessThan(2);
  const paid = workflow.locator('article').filter({ hasText: 'Schedule payment' });
  const wrapper = paid.locator('xpath=ancestor::*[contains(@class, "vflow-node")][1]');
  const position = () => wrapper.evaluate((element: HTMLElement) => element.style.transform);
  const start = await position();
  // Center the node: the docs header is sticky and would cover an element scrolled to the top edge.
  await paid.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const box = (await paid.locator('header').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 90, { steps: 10 });
  await page.mouse.up();
  await expect.poll(position).not.toBe(start);
  const after = await labelDistance();
  for (const label of after) expect(label.best, label.name).toBeLessThan(2);
  expect(after.map((label) => label.y)).not.toEqual(before.map((label) => label.y));
});

test('themes stay scoped per editor, reach every layer and leave core-only flows and geometry alone', async ({
  page,
}) => {
  await page.goto('/design-system/overview');
  const a = page.locator('[data-testid="editor-a"]');
  const b = page.locator('[data-testid="editor-b"]');
  const core = page.locator('[data-testid="editor-core"]');
  await core.scrollIntoViewIfNeeded();
  const light = { node: 'rgb(255, 255, 255)', edge: 'rgb(86, 101, 121)' };
  const dark = { node: 'rgb(27, 40, 59)', edge: 'rgb(175, 190, 209)' };
  await expect(a.locator('article.vui-node').first()).toHaveCSS('background-color', light.node);
  await expect(a.locator('path.vui-edge')).toHaveCSS('stroke', light.edge);
  await expect(a.locator('marker polyline')).toHaveCSS('fill', light.edge);
  await expect(b.locator('article.vui-node').first()).toHaveCSS('background-color', dark.node);
  await expect(b.locator('path.vui-edge')).toHaveCSS('stroke', dark.edge);
  // Core-only flow keeps its own defaults although the UI stylesheet is loaded on the page.
  await expect(core.locator('.edge').first()).toHaveCSS('stroke', 'rgb(177, 177, 183)');
  await expect(core.locator('default-node').first()).toHaveCSS('border-color', 'rgb(27, 38, 44)');
  await expect(core.locator('.vflow-root')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  const geometry = () =>
    a.evaluate((root) =>
      Array.from(root.querySelectorAll<HTMLElement>('.vflow-node, .handle, path.vui-edge')).map(
        (element) =>
          element.getAttribute('d') ?? `${element.style.transform}|${element.style.top}|${element.style.left}`,
      ),
    );
  const minimapPixel = () =>
    a.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const [r, g, b, alpha] = canvas.getContext('2d')!.getImageData(2, 2, 1, 1).data;
      return `${r},${g},${b},${alpha}`;
    });
  const before = await geometry();
  const pixelBefore = await minimapPixel();
  await page.getByLabel('Dark first editor', { exact: true }).check();
  await expect(a.locator('article.vui-node').first()).toHaveCSS('background-color', dark.node);
  await expect(a.locator('path.vui-edge')).toHaveCSS('stroke', dark.edge);
  await expect(a.locator('marker polyline')).toHaveCSS('fill', dark.edge);
  await expect(a.locator('.vflow-root')).toHaveCSS('background-color', 'rgb(16, 24, 39)');
  await expect.poll(minimapPixel).not.toBe(pixelBefore);
  expect(await geometry()).toEqual(before);
  await expect(b.locator('article.vui-node').first()).toHaveCSS('background-color', dark.node);
  await expect(core.locator('.edge').first()).toHaveCSS('stroke', 'rgb(177, 177, 183)');
});
