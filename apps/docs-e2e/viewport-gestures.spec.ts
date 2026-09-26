import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ hasTouch: true });

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

async function viewport(graph: Locator): Promise<Viewport> {
  return graph.locator('.vflow-viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

async function open(page: Page) {
  await page.goto('/interactions/viewport-gestures');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('.vflow-node').first()).toBeVisible();
  const pane = (await graph.locator('.vflow-pane').boundingBox())!;
  return { graph, pane };
}

/** An empty canvas point, away from nodes and edges. */
function empty(pane: { x: number; y: number; width: number; height: number }) {
  return { x: pane.x + pane.width - 40, y: pane.y + pane.height - 30 };
}

/** Samples the viewport on every animation frame for `ms`. */
async function record(graph: Locator, ms: number, start: () => Promise<unknown>) {
  const samples = graph.locator('.vflow-viewport').evaluate(
    (element, ms) =>
      new Promise<Viewport[]>((resolve) => {
        const samples: Viewport[] = [];
        const end = performance.now() + ms;
        const tick = () => {
          const matrix = new DOMMatrix(getComputedStyle(element).transform);
          samples.push({ x: matrix.e, y: matrix.f, zoom: matrix.a });
          if (performance.now() < end) requestAnimationFrame(tick);
          else resolve(samples);
        };
        tick();
      }),
    ms,
  );
  await start();
  return samples;
}

function distinct(samples: Viewport[]) {
  return new Set(samples.map((sample) => `${sample.x},${sample.y},${sample.zoom}`)).size;
}

test('pans by the dragged distance, suppresses the click after a pan and clears selection on a plain click', async ({
  page,
}) => {
  const { graph, pane } = await open(page);
  const node = graph.locator('.vflow-node').first();
  const presentation = node.locator('[data-vui-selected]');
  const point = empty(pane);

  await node.click();
  await expect(presentation).toHaveAttribute('data-vui-selected', 'true');

  const start = await viewport(graph);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x - 120, point.y - 40, { steps: 6 });
  await page.mouse.up();
  const panned = await viewport(graph);
  expect(panned.x - start.x).toBeCloseTo(-120, 0);
  expect(panned.y - start.y).toBeCloseTo(-40, 0);
  // A pan is not a click on the canvas, so the selection stays.
  await expect(presentation).toHaveAttribute('data-vui-selected', 'true');

  await page.mouse.click(point.x, point.y);
  await expect(presentation).toHaveAttribute('data-vui-selected', 'false');
  expect(await viewport(graph)).toEqual(panned);
});

test('zooms the wheel around the cursor and scroll-pans once panOnScroll is enabled', async ({ page }) => {
  const { graph, pane } = await open(page);
  const point = empty(pane);
  const before = await viewport(graph);
  const flowX = (point.x - pane.x - before.x) / before.zoom;
  const flowY = (point.y - pane.y - before.y) / before.zoom;

  await page.mouse.move(point.x, point.y);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await viewport(graph)).zoom).toBeCloseTo(before.zoom * 2 ** 0.2, 5);
  const zoomed = await viewport(graph);
  expect((point.x - pane.x - zoomed.x) / zoomed.zoom).toBeCloseTo(flowX, 2);
  expect((point.y - pane.y - zoomed.y) / zoomed.zoom).toBeCloseTo(flowY, 2);

  await page.getByLabel('panOnScroll').check();
  await page.mouse.move(point.x, point.y);
  await page.mouse.wheel(30, 60);
  await expect.poll(async () => (await viewport(graph)).y).toBeCloseTo(zoomed.y - 60, 0);
  expect((await viewport(graph)).x).toBeCloseTo(zoomed.x - 30, 0);
  expect((await viewport(graph)).zoom).toBe(zoomed.zoom);
});

test('animates double-click zoom around the pointer and the animated fit view', async ({ page }) => {
  const { graph, pane } = await open(page);
  const point = empty(pane);
  const before = await viewport(graph);

  const zooming = await record(graph, 600, () => page.mouse.dblclick(point.x, point.y));
  expect(distinct(zooming)).toBeGreaterThan(4);
  const zoomed = zooming.at(-1)!;
  expect(zoomed.zoom).toBeCloseTo(before.zoom * 2, 5);
  expect((point.x - pane.x - zoomed.x) / zoomed.zoom).toBeCloseTo((point.x - pane.x - before.x) / before.zoom, 2);

  const fitting = await record(graph, 900, () => page.getByRole('button', { name: 'Fit view' }).click());
  expect(distinct(fitting)).toBeGreaterThan(8);
  const fitted = fitting.at(-1)!;
  // Every node is visible after fitting.
  for (const box of await graph
    .locator('.vflow-node')
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON() as DOMRect))) {
    expect(box.left).toBeGreaterThanOrEqual(pane.x - 1);
    expect(box.right).toBeLessThanOrEqual(pane.x + pane.width + 1);
  }
  expect(fitted.zoom).not.toBe(zoomed.zoom);
});

test('drags a node without panning and without the click that selects it', async ({ page }) => {
  const { graph } = await open(page);
  const node = graph.locator('.vflow-node').first();
  const box = (await node.boundingBox())!;
  const start = await viewport(graph);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30, { steps: 6 });
  await page.mouse.up();

  const moved = (await node.boundingBox())!;
  expect(moved.x - box.x).toBeCloseTo(60, 0);
  expect(moved.y - box.y).toBeCloseTo(30, 0);
  expect(await viewport(graph)).toEqual(start);
  await expect(node.locator('[data-vui-selected]')).toHaveAttribute('data-vui-selected', 'false');
});

test('pans with one finger and pinches with two, and sets touch-action from the settings', async ({ page }) => {
  const { graph, pane } = await open(page);
  const cdp = await page.context().newCDPSession(page);
  const touch = async (type: string, points: { x: number; y: number }[]) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map((p, id) => ({ ...p, id })) });
  const center = { x: pane.x + pane.width / 2, y: pane.y + pane.height - 40 };

  await expect(graph.locator('.vflow-pane')).toHaveCSS('touch-action', 'none');
  await expect(graph.locator('.vflow-node').first()).toHaveCSS('touch-action', 'none');

  const start = await viewport(graph);
  await touch('touchStart', [center]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [{ x: center.x + 10 * i, y: center.y - 5 * i }]);
  await touch('touchEnd', []);
  const panned = await viewport(graph);
  expect(panned.x - start.x).toBeCloseTo(60, 0);
  expect(panned.y - start.y).toBeCloseTo(-30, 0);

  const spread = (h: number) => [
    { x: center.x - h, y: center.y },
    { x: center.x + h, y: center.y },
  ];
  await touch('touchStart', spread(40));
  for (let h = 45; h <= 80; h += 5) await touch('touchMove', spread(h));
  await touch('touchEnd', []);
  const pinched = await viewport(graph);
  expect(pinched.zoom / panned.zoom).toBeCloseTo(2, 2);
  // The middle of the fingers keeps its flow point.
  const cx = center.x - pane.x;
  expect((cx - pinched.x) / pinched.zoom).toBeCloseTo((cx - panned.x) / panned.zoom, 1);

  await page.getByLabel('panOnDrag').uncheck();
  await expect(graph.locator('.vflow-pane')).toHaveCSS('touch-action', 'pan-x pan-y');
  await page.getByLabel('zoomOnPinch').uncheck();
  await expect(graph.locator('.vflow-pane')).toHaveCSS('touch-action', 'auto');
});

test('lazy loading moves smoothly to the next node and lands exactly on it', async ({ page }) => {
  await page.goto('/performance/lazy-loading');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('.vflow-node').first()).toBeVisible();
  // Let the initial fit view animation finish.
  await expect.poll(async () => (await viewport(graph)).zoom, { timeout: 3000 }).toBeGreaterThan(0);
  await page.waitForTimeout(1000);
  const initial = await viewport(graph);

  const samples = await record(graph, 1300, () => page.getByRole('button', { name: 'Go To Next Node' }).click());
  const final = samples.at(-1)!;
  expect(distinct(samples)).toBeGreaterThan(20);
  expect(final).not.toEqual(initial);
  // The van Wijk path zooms out on the way between distant nodes.
  expect(Math.min(...samples.map((sample) => sample.zoom))).toBeLessThan(Math.min(initial.zoom, final.zoom));

  // The target node is centered in the pane.
  const pane = (await graph.locator('.vflow-pane').boundingBox())!;
  const target = (await graph.locator('.vflow-node').nth(1).boundingBox())!;
  expect(target.x + target.width / 2).toBeCloseTo(pane.x + pane.width / 2, 0);
  expect(target.y + target.height / 2).toBeCloseTo(pane.y + pane.height / 2, 0);
});
