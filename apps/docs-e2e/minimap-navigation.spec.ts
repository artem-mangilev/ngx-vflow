import { expect, test, type Locator } from '@playwright/test';

test.use({ hasTouch: true, deviceScaleFactor: 2 });

/** Gap between the content of the minimap and its edges, in CSS pixels. */
const PADDING = 5;

/** Zoom factor of one wheel event on the minimap: half a step of the zoom keys, which is 1.2. */
const WHEEL_ZOOM = Math.sqrt(1.2);

async function viewport(graph: Locator) {
  return graph.locator('.v-viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

/**
 * The geometry the minimap is expected to show, derived from the rendered nodes and the viewport, independently of
 * the canvas directive: flow space maps to the canvas so that the bounds of the nodes united with the visible area
 * fit inside the padding.
 */
async function geometry(graph: Locator) {
  return graph.evaluate((element, padding) => {
    const pane = element.querySelector('.v-pane')!.getBoundingClientRect();
    const canvas = element.querySelector('canvas')!.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(element.querySelector('.v-viewport')!).transform);
    const nodes = Array.from(element.querySelectorAll('[data-v-node]'), (node) => node.getBoundingClientRect());
    const view = {
      x: -matrix.e / matrix.a,
      y: -matrix.f / matrix.a,
      width: pane.width / matrix.a,
      height: pane.height / matrix.a,
    };
    const flowX = (client: number) => (client - pane.left - matrix.e) / matrix.a;
    const flowY = (client: number) => (client - pane.top - matrix.f) / matrix.a;
    const left = Math.min(view.x, ...nodes.map((node) => flowX(node.left)));
    const top = Math.min(view.y, ...nodes.map((node) => flowY(node.top)));
    const right = Math.max(view.x + view.width, ...nodes.map((node) => flowX(node.right)));
    const bottom = Math.max(view.y + view.height, ...nodes.map((node) => flowY(node.bottom)));
    const scale = Math.min(
      (canvas.width - padding * 2) / (right - left),
      (canvas.height - padding * 2) / (bottom - top),
    );
    const offset = {
      x: canvas.width / 2 - ((left + right) / 2) * scale,
      y: canvas.height / 2 - ((top + bottom) / 2) * scale,
    };
    return {
      canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
      pane: { x: pane.x, y: pane.y, width: pane.width, height: pane.height },
      scale,
      offset,
      // Where the middle of the visible area is on the page: a press there is a press on the viewport.
      viewportCenter: {
        x: canvas.x + offset.x + (view.x + view.width / 2) * scale,
        y: canvas.y + offset.y + (view.y + view.height / 2) * scale,
      },
    };
  }, PADDING);
}

type Geometry = Awaited<ReturnType<typeof geometry>>;

/** The flow point the minimap shows at a point of the page. */
function flowPoint(map: Geometry, x: number, y: number) {
  return { x: (x - map.canvas.x - map.offset.x) / map.scale, y: (y - map.canvas.y - map.offset.y) / map.scale };
}

/** The part of the canvas the mask leaves open, in CSS pixels of the canvas: the viewport as the minimap marks it. */
async function markedViewport(graph: Locator) {
  return graph.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const { data, width, height } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const ratio = width / canvas.getBoundingClientRect().width;
    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] !== 0) continue;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x + 1);
        bottom = Math.max(bottom, y + 1);
      }
    }
    return {
      left: left / ratio,
      top: top / ratio,
      right: right / ratio,
      bottom: bottom / ratio,
      width: canvas.getBoundingClientRect().width,
      height: canvas.getBoundingClientRect().height,
    };
  });
}

test('clicks, captures mouse drags outside the overview, preserves zoom and leaves the surrounding pane usable', async ({
  page,
}) => {
  await page.goto('/docs/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveCSS('pointer-events', 'auto');
  let map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width / 2);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(WHEEL_ZOOM);
  map = await geometry(graph);
  const clicked = flowPoint(map, x, y);
  await page.mouse.click(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - clicked.x * WHEEL_ZOOM, 0);
  await expect.poll(async () => (await viewport(graph)).y).toBeCloseTo(map.pane.height / 2 - clicked.y * WHEEL_ZOOM, 0);
  const start = await viewport(graph);
  map = await geometry(graph);
  const grab = map.viewportCenter;
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  expect(await viewport(graph)).toEqual(start);
  // One move to a point above the canvas, still inside the graph: the viewport follows the movement at the scale
  // the minimap has at that moment.
  await page.mouse.move(grab.x - 20, grab.y - map.canvas.height);
  await page.mouse.up();
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(start.x + (20 * WHEEL_ZOOM) / map.scale, 0);
  await expect
    .poll(async () => (await viewport(graph)).y)
    .toBeCloseTo(start.y + (map.canvas.height * WHEEL_ZOOM) / map.scale, 0);
  const released = await viewport(graph);
  await page.mouse.move(x, y);
  expect(await viewport(graph)).toEqual(released);
  // The minimap is a block in its corner: the rest of the pane is not covered.
  const outside = { x: map.pane.x + 20, y: map.pane.y + 20 };
  await page.mouse.move(outside.x, outside.y);
  await page.mouse.down();
  await page.mouse.move(outside.x + 30, outside.y, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(released.x + 30, 0);
});

test('keeps the viewport on the minimap however far the pane is panned or zoomed', async ({ page }) => {
  await page.goto('/docs/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const pane = (await graph.locator('.v-pane').boundingBox())!;

  const expectMarked = async () => {
    const map = await geometry(graph);
    const marked = await markedViewport(graph);
    expect(marked.left).toBeGreaterThanOrEqual(0);
    expect(marked.top).toBeGreaterThanOrEqual(0);
    expect(marked.right).toBeLessThanOrEqual(marked.width);
    expect(marked.bottom).toBeLessThanOrEqual(marked.height);
    // The mask leaves open what the pane shows, within a pixel on each edge.
    expect(Math.abs((marked.left + marked.right) / 2 - (map.viewportCenter.x - map.canvas.x))).toBeLessThan(1.5);
    expect(Math.abs((marked.top + marked.bottom) / 2 - (map.viewportCenter.y - map.canvas.y))).toBeLessThan(1.5);
  };

  await expectMarked();
  // Far beyond the nodes: three pane widths to the right of the graph.
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(pane.x + 30, pane.y + 30);
    await page.mouse.down();
    await page.mouse.move(pane.x + 30 - 500, pane.y + 30 - 100, { steps: 4 });
    await page.mouse.up();
  }
  await expect.poll(async () => (await viewport(graph)).x).toBeLessThan(-2500);
  await expectMarked();
  // Zoomed out to the limit, where the pane shows more than the graph.
  await page.mouse.move(pane.x + pane.width / 2, pane.y + 30);
  for (let i = 0; i < 30; i++) await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(0.5);
  await expectMarked();
});

test('keeps wheel zoom within limits, blocks page scrolling, and aligns after resize at high DPI', async ({ page }) => {
  await page.goto('/docs/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.hover();
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, -100);
    await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(Math.min(WHEEL_ZOOM ** (i + 1), 3));
  }
  const scroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -100);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.setViewportSize({ width: 1000, height: 900 });
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => canvas.evaluate((el) => (el as HTMLCanvasElement).width)).toBeGreaterThan(0);
  // The bitmap is in device pixels of the box the CSS gives the canvas.
  await page.waitForFunction(() => {
    const canvas = document.querySelector('vflow canvas') as HTMLCanvasElement;
    return Math.abs(canvas.width - canvas.getBoundingClientRect().width * devicePixelRatio) <= 1;
  });
  const map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width * 0.7);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  const clicked = flowPoint(map, x, y);
  await page.mouse.click(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - clicked.x * 3, 0);
});

test('supports real touch tap and drag, releases cancellation, and does not select nodes', async ({
  page,
  context,
}) => {
  await page.goto('/docs/viewport/minimap');
  const graph = page.locator('vflow').first();
  const canvas = graph.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  let map = await geometry(graph);
  const x = Math.round(map.canvas.x + map.canvas.width / 2);
  const y = Math.round(map.canvas.y + map.canvas.height / 2);
  const tapped = flowPoint(map, x, y);
  await page.touchscreen.tap(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(map.pane.width / 2 - tapped.x, 0);
  const start = await viewport(graph);
  map = await geometry(graph);
  const grab = map.viewportCenter;
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: grab.x, y: grab.y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: grab.x - 20, y: grab.y }] });
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(start.x + 20 / map.scale, 0);
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  const cancelled = await viewport(graph);
  await page.mouse.move(x + 20, y);
  expect(await viewport(graph)).toEqual(cancelled);
  // The viewport moved along the graph only, so the minimap shows the same scale and the same point under the tap.
  await page.touchscreen.tap(x, y);
  await expect.poll(async () => (await viewport(graph)).x).toBeCloseTo(start.x, 0);
  await expect(graph.locator('[aria-selected="true"]')).toHaveCount(0);
  await client.detach();
});
