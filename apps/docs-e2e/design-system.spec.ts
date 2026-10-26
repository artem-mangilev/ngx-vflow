import { expect, Locator, Page, test } from '@playwright/test';

/** Demos follow the docs theme: cycle the ng-doc toggle (auto, light, dark) until the page has the theme. */
async function setDocsTheme(page: Page, theme: 'light' | 'dark') {
  const expected = theme === 'dark' ? 'dark' : null;
  for (let index = 0; index < 3; index += 1) {
    if ((await page.locator('html').getAttribute('data-theme')) === expected) return;
    await page.locator('ng-doc-theme-toggle button').click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function rowAlignment(demo: Locator) {
  return demo.locator('[vuiRow]').evaluateAll((rows) =>
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
  await expect(workflow.locator('.v-edge-labels-layer .vui-edge-label')).toHaveCount(4);
  await expect(workflow.locator('article.vui-node').first()).toHaveCSS('background-color', 'oklch(1 0 0)');
  // Directives add classes to the consumer article/header, without injecting wrapper elements.
  await expect(workflow.locator('article > header.vui-node-header')).toHaveCount(4);
  const review = workflow.locator('article').filter({ hasText: 'Finance review' });
  await review.locator('header').click();
  await expect(review).toHaveAttribute('data-vui-selected', 'true');
  // Selection and application status are visible at the same time.
  await expect(review.locator('.badge')).toHaveText('Waiting');
  await expect(review.locator('.badge')).toHaveAttribute('data-tone', 'warning');
  await expect(workflow.locator('v-node-toolbar .vui-toolbar')).toBeAttached();
  await expect(workflow.getByRole('button', { name: 'Zoom to Finance review', exact: true })).toBeVisible();
  const paid = workflow.locator('article').filter({ hasText: 'Schedule payment' });
  await expect(paid.locator('.badge')).toHaveText('Scheduling');
  // A status is presentation only: the node keeps its action enabled.
  const approve = review.getByRole('button', { name: 'Approve', exact: true });
  await expect(approve).toBeEnabled();
  await approve.focus();
  await expect(approve).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(review.locator('.badge')).toHaveText('Approved');
  await expect(approve).toBeDisabled();
  await expect(review).toHaveAttribute('data-vui-selected', 'true');
  // The demo follows the docs theme toggle.
  await setDocsTheme(page, 'dark');
  await expect(review).toHaveCSS('background-color', 'oklch(0.21 0.006 285.885)');
  // Floating layers use the translucent dark surface (85%) as their material.
  await expect(workflow.locator('v-node-toolbar .vui-toolbar')).toHaveCSS(
    'background-color',
    /^oklab\(0\.21\d* .* \/ 0\.85\)$/,
  );
  await expect(workflow.locator('path.vui-edge').first()).toHaveCSS('stroke', 'oklch(0.705 0.015 286.067)');
  await expect(workflow.locator('marker polyline').first()).toHaveCSS('fill', 'context-stroke');
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
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect(demo.locator('.vui-port[data-vui-connected="true"]')).toHaveCount(4);
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  // Rename and reorder the rows in the DOM, as a re-render of changed field data does: core observes the node content.
  await demo
    .locator('[data-entity="crm"] [data-field="email"] .vui-title')
    .evaluate((element) => (element.textContent = 'primary_email'));
  await demo.locator('article.vui-node').evaluateAll((entities) =>
    entities.forEach((entity) => {
      const rows = Array.from(entity.querySelectorAll('[vuiRow]'));
      entity.append(...rows.reverse());
    }),
  );
  await expect(demo.locator('[data-entity="crm"] [vuiRow]').first()).toHaveAttribute('data-field', 'name');
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);
  // Density follows the theme spacing.
  await demo
    .locator('section.demo')
    .evaluate((element: HTMLElement) => element.style.setProperty('--vui-space', '3px'));
  await expect.poll(() => rowAlignment(demo)).toBeLessThan(1);

  // The actual SVG endpoints must meet the outer rim of their original field ports.
  const endpointError = () =>
    demo.evaluate((root) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[1];
      const source = root
        .querySelector('[data-entity="crm"] [data-field="email"] .vui-port.v-handle[data-v-handle-position="right"]')!
        .getBoundingClientRect();
      const target = root
        .querySelector('[data-entity="erp"] [data-field="email"] .vui-port.v-handle[data-v-handle-position="left"]')!
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
  await expect(demo.locator('.vui-port[data-vui-connected="true"]')).toHaveCount(2);
  const source = demo.locator('[data-entity="crm"] [data-field="email"] .v-handle[data-v-handle-position="right"]');
  const target = demo.locator('[data-entity="erp"] [data-field="email"] .v-handle[data-v-handle-position="left"]');
  // Core intentionally overlays the target with its magnetic hit area during a connection.
  // Move the pointer through that real surface instead of asking locator.dragTo to bypass it.
  await source.scrollIntoViewIfNeeded();
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await expect(target).toHaveAttribute('data-vui-state', 'valid');
  await page.mouse.up();
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await expect(demo.getByRole('button', { name: 'Remove Mapping connection', exact: true })).toBeVisible();
  await expect(demo.locator('.vui-port[data-vui-connected="true"]')).toHaveCount(4);
  await expect.poll(endpointError).toBeLessThan(1);
  await demo.screenshot({ path: testInfo.outputPath('entities.png') });
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
    workflow.locator('.v-viewport').evaluate((element) => {
      const match = /scale\(([^)]+)\)/.exec(element.style.transform);
      return match ? Number(match[1]) : 1;
    });
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
  const viewportTransform = () => workflow.locator('.v-viewport').evaluate((element) => element.style.transform);
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
  const wrapper = paid.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-node ")][1]');
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

test('themes stay scoped per editor, reach every layer and leave geometry alone', async ({ page }) => {
  await page.goto('/design-system/overview');
  const a = page.locator('[data-testid="editor-a"]');
  const b = page.locator('[data-testid="editor-b"]');
  await b.scrollIntoViewIfNeeded();
  const light = { node: 'oklch(1 0 0)', edge: 'oklch(0.53 0.016 285.938)' };
  const dark = { node: 'oklch(0.21 0.006 285.885)', edge: 'oklch(0.705 0.015 286.067)' };
  await expect(a.locator('article.vui-node').first()).toHaveCSS('background-color', light.node);
  await expect(a.locator('path.vui-edge')).toHaveCSS('stroke', light.edge);
  // Markers take the edge stroke through context-stroke, so theming the edge themes its arrowhead.
  await expect(a.locator('marker polyline')).toHaveCSS('fill', 'context-stroke');
  await expect(b.locator('article.vui-node').first()).toHaveCSS('background-color', dark.node);
  await expect(b.locator('path.vui-edge')).toHaveCSS('stroke', dark.edge);

  const geometry = () =>
    a.evaluate((root) =>
      Array.from(root.querySelectorAll<HTMLElement>('.v-node, .v-handle, path.vui-edge')).map(
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
  await expect(a.locator('.v-root')).toHaveCSS('background-color', 'oklch(0.141 0.005 285.823)');
  await expect.poll(minimapPixel).not.toBe(pixelBefore);
  expect(await geometry()).toEqual(before);
  await expect(b.locator('article.vui-node').first()).toHaveCSS('background-color', dark.node);
});

/** Drags with real pointer events from the center of one element to a point; the page must not scroll in between. */
async function dragTo(page: Page, from: Locator, to: { x: number; y: number }) {
  const box = (await from.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 15 });
  await page.mouse.up();
}

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test('image lab: typed ports, previews that follow the wiring, native controls and export', async ({ page }) => {
  await page.goto('/design-system/pipeline');
  const demo = page.locator('app-ui-pipeline-demo');
  await demo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(demo.locator('article.vui-node')).toHaveCount(7);
  await expect(demo.locator('path.vui-edge')).toHaveCount(6);
  await expect(demo.locator('path.vui-edge[data-type="number"]')).toHaveCount(1);
  // The output preview is the whole tree: the hue-rotated photo blended with the blurred texture.
  const output = demo.locator('[data-preview="output"]');
  await expect(output.locator('.stack')).toHaveCount(1);
  await expect(output.locator('img')).toHaveCount(2);
  const filterOf = (stage: string) =>
    demo
      .locator(`[data-preview="${stage}"] > app-picture > .layer`)
      .evaluate((element: HTMLElement) => element.style.filter);
  // The number wired into Hue owns its amount: the row names the source instead of offering a slider.
  const hue = demo.locator('[data-stage="hue"]');
  await expect(hue.getByLabel('Hue amount', { exact: true })).toHaveCount(0);
  await expect(hue.getByTestId('linked')).toHaveText('from Number');
  await expect.poll(() => filterOf('hue')).toBe('hue-rotate(90deg)');
  await demo.getByLabel('Number value', { exact: true }).fill('0.5');
  await expect.poll(() => filterOf('hue')).toBe('hue-rotate(180deg)');
  // Native controls inside a node work and do not drag it.
  const blur = demo.locator('[data-stage="blur"]');
  const wrapper = blur.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-node ")][1]');
  const position = () => wrapper.evaluate((element: HTMLElement) => element.style.transform);
  const start = await position();
  await blur.getByLabel('Blur amount', { exact: true }).fill('0.8');
  await expect.poll(() => filterOf('blur')).toBe('blur(7.8px)');
  expect(await position()).toBe(start);
  // A new source picture reaches every preview downstream.
  await demo.locator('[data-stage="photo"] select').selectOption('lake');
  const photo = await demo.locator('[data-preview="photo"] img').getAttribute('src');
  await expect(output.locator('img').first()).toHaveAttribute('src', photo!);
  // Types must match: a number does not connect to an image input.
  const blendB = demo.locator('[data-stage="blend"] [data-port="b"] .v-handle');
  const value = await center(demo.locator('[data-stage="wave"] .output .v-handle'));
  const b = await center(blendB);
  await page.mouse.move(value.x, value.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await expect(blendB).toHaveAttribute('data-vui-state', 'invalid');
  await page.mouse.up();
  await expect(demo.locator('path.vui-edge')).toHaveCount(6);
  // An input takes one edge: wiring the photo into B replaces the texture branch.
  await dragTo(page, demo.locator('[data-stage="photo"] .output .v-handle'), await center(blendB));
  await expect(demo.locator('path.vui-edge')).toHaveCount(6);
  await expect(demo.locator('[data-stage="blur"] .output .vui-port')).toHaveAttribute('data-vui-connected', 'false');
  await expect(output.locator('img')).toHaveCount(2);
  await expect(output.locator('img').last()).toHaveAttribute('src', photo!);
  // The palette adds a node; an unwired filter shows an empty state.
  await demo.getByLabel('Add a node', { exact: true }).selectOption('sepia');
  await expect(demo.locator('article.vui-node')).toHaveCount(8);
  await expect(demo.locator('article').filter({ hasText: 'Sepia' }).locator('.empty')).toHaveText('Connect an image');
  // Only the export rasterizes the picture.
  const download = page.waitForEvent('download');
  await demo.getByRole('button', { name: 'Download', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('image-lab.png');
});

test('relationships map: nested resizable teams, people moving between teams, group connections', async ({ page }) => {
  await page.goto('/design-system/relationships-map');
  const demo = page.locator('app-ui-relationships-demo');
  await demo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(demo.locator('.vui-group')).toHaveCount(3);
  await expect(demo.locator('article.vui-node')).toHaveCount(7);
  await expect(demo.locator('path.vui-edge')).toHaveCount(5);
  await expect(demo.locator('svg.avatar')).toHaveCount(5);
  await expect(demo.locator('.note .v-handle')).toHaveCount(0);
  // The edge between the two top-level groups starts at the group's own handle.
  const groupEdgeError = () =>
    demo.evaluate((root) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[0];
      const source = root
        .querySelector('[data-team="platform"] .vui-port.v-handle[data-v-handle-position="right"]')!
        .getBoundingClientRect();
      const start = edge.getPointAtLength(0).matrixTransform(edge.getScreenCTM()!);
      return Math.max(Math.abs(start.x - source.right), Math.abs(start.y - source.y - source.height / 2));
    });
  await expect.poll(groupEdgeError).toBeLessThan(1.5);
  await expect(demo.locator('.v-edge-labels-layer .vui-edge-label').first()).toHaveText('3 shared services');

  const members = (team: string) => demo.locator(`[data-team="${team}"] [data-testid="members"]`);
  const team = (id: string) => demo.locator(`[data-team="${id}"]`);
  const person = (name: string) => demo.locator('article').filter({ hasText: name });
  // How far a person sticks out of a team; at most zero means inside.
  const overflow = (name: string, id: string) =>
    demo.evaluate(
      (root, [name, id]) => {
        const box = root.querySelector(`[data-team="${id}"]`)!.getBoundingClientRect();
        const rect = Array.from(root.querySelectorAll('article.person'))
          .find((element) => element.textContent!.includes(name))!
          .getBoundingClientRect();
        return Math.max(box.left - rect.left, box.top - rect.top, rect.right - box.right, rect.bottom - box.bottom);
      },
      [name, id],
    );
  // A nested team counts toward its parent.
  await expect(members('platform')).toHaveText('3 people');
  await expect(members('infra')).toHaveText('2 people');
  await expect(members('growth')).toHaveText('2 people');
  for (const [name, id] of [
    ['Ana Lima', 'platform'],
    ['Ben Osei', 'infra'],
    ['Eli Park', 'infra'],
    ['Chi Nguyen', 'growth'],
    ['Dea Rossi', 'growth'],
  ]) {
    expect(await overflow(name, id), name).toBeLessThanOrEqual(0.5);
  }

  // Dropping a person on a team moves them there; the innermost team wins.
  await dragTo(page, person('Dea Rossi').locator('header'), await center(team('infra')));
  await expect(members('infra')).toHaveText('3 people');
  await expect(members('platform')).toHaveText('4 people');
  await expect(members('growth')).toHaveText('1 person');
  await expect.poll(() => overflow('Dea Rossi', 'infra')).toBeLessThanOrEqual(0.5);

  // Dropping outside every team returns the person into their own team.
  const growth = (await team('growth').boundingBox())!;
  await dragTo(page, person('Chi Nguyen').locator('header'), {
    x: growth.x + growth.width / 2,
    y: growth.y + growth.height + 70,
  });
  await expect(members('growth')).toHaveText('1 person');
  await expect.poll(() => overflow('Chi Nguyen', 'growth')).toBeLessThanOrEqual(0.5);

  // A selected team resizes; it cannot shrink past its members.
  await team('growth').locator('header').click();
  const handle = demo.locator('.v-resize-control--handle.v-resize-control--bottom.v-resize-control--right');
  await expect(handle).toHaveCount(1);
  const before = (await team('growth').boundingBox())!;
  await dragTo(page, handle, { x: before.x + 20, y: before.y + 20 });
  // Chi was dropped below the team and sits at its bottom: the width shrinks, the height stays for Chi.
  await expect.poll(async () => (await team('growth').boundingBox())!.width).toBeLessThan(before.width - 20);
  expect((await team('growth').boundingBox())!.height).toBeCloseTo(before.height, 0);
  expect(await overflow('Chi Nguyen', 'growth')).toBeLessThanOrEqual(0.5);
});

test('scroll and collapse experiment: model kept, endpoints move to the header and back, wheel scrolls rows', async ({
  page,
}) => {
  await page.goto('/design-system/erd-schema-mapping');
  const demo = page.locator('app-ui-scroll-collapse-demo');
  await demo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  const rows = demo.locator('[data-rows="product"]');
  await expect(rows.locator('[vuiRow]')).toHaveCount(12);
  const edgeStart = (index: number) =>
    demo.evaluate((root, i) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[i];
      const point = edge.getPointAtLength(0).matrixTransform(edge.getScreenCTM()!);
      return { x: point.x, y: point.y };
    }, index);
  const portCenter = (selector: string) =>
    demo.evaluate((root, s) => {
      const rect = root.querySelector(s)!.getBoundingClientRect();
      return { x: rect.right, y: rect.y + rect.height / 2 };
    }, selector);
  const rowPort = '[data-entity="product"] [data-field="brand-id"] .vui-port.v-handle[data-v-handle-position="right"]';
  const footerPort = '[data-entity="product"] footer .vui-port.v-handle[data-v-handle-position="right"]';
  const distance = (index: number, selector: string) => async () => {
    const start = await edgeStart(index);
    const port = await portCenter(selector);
    return Math.hypot(start.x - port.x, start.y - port.y);
  };
  // Initial layout: the brand edge sits on its visible row, the supplier edge on the footer proxy.
  await expect.poll(distance(1, rowPort)).toBeLessThan(1.5);
  await expect.poll(distance(0, footerPort)).toBeLessThan(1.5);
  // Wheel over the rows scrolls them instead of zooming the graph.
  const zoom = () => demo.locator('.v-viewport').evaluate((element) => element.style.transform);
  const zoomBefore = await zoom();
  const box = (await rows.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => rows.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await zoom()).toBe(zoomBefore);
  // Demo policy: the supplier edge stays on the footer proxy, the visible brand row keeps its re-measured handle.
  await expect.poll(distance(0, footerPort)).toBeLessThan(1.5);
  await expect.poll(distance(1, rowPort)).toBeLessThan(1.5);
  await rows.evaluate((element) => (element.scrollTop = 0));
  // Collapse: rows leave the DOM, proxy handles keep both edges attached to the header.
  await demo.getByRole('button', { name: 'Collapse Product', exact: true }).click();
  await expect(rows).toHaveCount(0);
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  const headerPort = '[data-entity="product"] header .vui-port.v-handle[data-v-handle-position="right"]';
  await expect.poll(distance(1, headerPort)).toBeLessThan(1.5);
  await expect.poll(distance(0, headerPort)).toBeLessThan(1.5);
  // Expand: the same field IDs restore the endpoints on the rows.
  await demo.getByRole('button', { name: 'Expand Product', exact: true }).click();
  await expect(rows.locator('[vuiRow]')).toHaveCount(12);
  await expect.poll(distance(1, rowPort)).toBeLessThan(1.5);
  await expect.poll(distance(0, footerPort)).toBeLessThan(1.5);
});

test('ERD: deleting a field removes its edges and leaves no detached endpoints', async ({ page }) => {
  await page.goto('/design-system/erd-schema-mapping');
  const demo = page.locator('app-ui-entities-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  await demo.getByRole('button', { name: 'Delete CRM contact.email', exact: true }).click();
  await expect(demo.locator('[data-entity="crm"] [vuiRow]')).toHaveCount(1);
  await expect(demo.locator('path.vui-edge')).toHaveCount(1);
  await expect(demo.locator('.vui-port[data-vui-connected="true"]')).toHaveCount(2);
});
