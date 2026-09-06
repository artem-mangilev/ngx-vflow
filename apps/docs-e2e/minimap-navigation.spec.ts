import { expect, test, type Locator } from '@playwright/test';

test.use({ hasTouch: true, deviceScaleFactor: 2 });

async function viewport(graph: Locator) {
  return graph.locator('.vflow-viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

// Derive expected overview geometry from rendered node bounds, independently of the canvas directive.
async function geometry(graph: Locator) {
  return graph.evaluate((element) => {
    const pane = element.querySelector('.vflow-pane')!.getBoundingClientRect();
    const canvas = element.querySelector('canvas')!.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(element.querySelector('.vflow-viewport')!).transform);
    const nodes = Array.from(element.querySelectorAll('.vflow-node'), (node) => node.getBoundingClientRect());
    const left = (Math.min(...nodes.map((node) => node.left)) - pane.left - matrix.e) / matrix.a;
    const top = (Math.min(...nodes.map((node) => node.top)) - pane.top - matrix.f) / matrix.a;
    const right = (Math.max(...nodes.map((node) => node.right)) - pane.left - matrix.e) / matrix.a;
    const bottom = (Math.max(...nodes.map((node) => node.bottom)) - pane.top - matrix.f) / matrix.a;
    return {
      canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
      pane: { x: pane.x, y: pane.y, width: pane.width, height: pane.height },
      center: { x: (left + right) / 2, y: (top + bottom) / 2 },
      scale: Math.min(canvas.width / (right - left), canvas.height / (bottom - top), 0.3),
    };
  });
}

test('clicks, captures mouse drags outside the overview, preserves zoom and leaves the surrounding pane usable', async ({
  page,
}) => {
  await page.goto('/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveCSS('pointer-events', 'auto');
  const map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width / 2);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(1.1);
  const flowX = map.center.x + (x - map.canvas.x - map.canvas.width / 2) / map.scale;
  const flowY = map.center.y + (y - map.canvas.y - map.canvas.height / 2) / map.scale;
  await page.mouse.click(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - flowX * 1.1, 0);
  await expect.poll(async () => (await viewport(graph)).y).toBeCloseTo(map.pane.height / 2 - flowY * 1.1, 0);
  const start = await viewport(graph);
  await page.mouse.move(x - 5, y);
  await page.mouse.down();
  expect(await viewport(graph)).toEqual(start);
  // Move above the canvas while remaining inside the graph.
  await page.mouse.move(x - 5, y - map.canvas.height, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await viewport(graph)).y)
    .toBeCloseTo(start.y + (map.canvas.height * 1.1) / map.scale, 0);
  const released = await viewport(graph);
  await page.mouse.move(x, y);
  expect(await viewport(graph)).toEqual(released);
  // The whole-overlay div must not intercept the pane here.
  const outside = { x: map.pane.x + 20, y: map.pane.y + 20 };
  await page.mouse.move(outside.x, outside.y);
  await page.mouse.down();
  await page.mouse.move(outside.x + 30, outside.y, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(released.x + 30, 0);
});

test('keeps wheel zoom within limits, blocks page scrolling, and aligns after resize at high DPI', async ({ page }) => {
  await page.goto('/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.hover();
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, -100);
    await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(Math.min(1.1 ** (i + 1), 3));
  }
  const scroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -100);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.setViewportSize({ width: 1000, height: 900 });
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).width)).toBeGreaterThan(0);
  await page.waitForFunction(() => {
    const canvas = document.querySelector('vflow canvas') as HTMLCanvasElement;
    return canvas.width === Math.round(canvas.getBoundingClientRect().width * devicePixelRatio);
  });
  const map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width * 0.7);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  await page.mouse.click(x, y);
  const flowX = map.center.x + (x - map.canvas.x - map.canvas.width / 2) / map.scale;
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - flowX * 3, 0);
});

test('supports real touch tap and drag, releases cancellation, and does not select nodes', async ({
  page,
  context,
}) => {
  await page.goto('/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width / 2);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  await page.touchscreen.tap(x, y);
  const flowX = map.center.x + (x - map.canvas.x - map.canvas.width / 2) / map.scale;
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - flowX, 0);
  const start = await viewport(graph);
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 20, y }] });
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(start.x + 20 / map.scale, 0);
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  const cancelled = await viewport(graph);
  await page.mouse.move(x + 20, y);
  expect(await viewport(graph)).toEqual(cancelled);
  await page.touchscreen.tap(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(start.x, 0);
  await expect(graph.locator('[aria-selected="true"]')).toHaveCount(0);
  await client.detach();
});
