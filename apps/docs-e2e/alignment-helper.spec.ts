import { expect, test, type Locator, type Page } from '@playwright/test';

/** Flow position of a node, from the transform the library writes on it. */
async function position(graph: Locator, id: string) {
  return graph.getByRole('group', { name: `Node ${id}`, exact: true }).evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f };
  });
}

/** Client point of a flow point. */
async function client(graph: Locator, x: number, y: number) {
  return graph.evaluate(
    (root, [x, y]) => {
      const pane = root.querySelector('.v-pane')!.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(root.querySelector('.v-viewport')!).transform);
      return { x: pane.x + matrix.e + x * matrix.a, y: pane.y + matrix.f + y * matrix.a };
    },
    [x, y],
  );
}

/** Moves the pointer to a flow point. */
async function moveTo(page: Page, graph: Locator, x: number, y: number) {
  const point = await client(graph, x, y);
  await page.mouse.move(point.x, point.y, { steps: 8 });
}

/** Presses at a flow point and moves the pointer to another; the caller releases. */
async function drag(page: Page, graph: Locator, from: { x: number; y: number }, to: { x: number; y: number }) {
  await moveTo(page, graph, from.x, from.y);
  await page.mouse.down();
  await moveTo(page, graph, to.x, to.y);
}

async function demo(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/viewport/alignment-helper');
  const graph = page.locator('vflow').first();
  await graph.scrollIntoViewIfNeeded();
  await expect(graph.locator('.v-node')).toHaveCount(7);
  await expect.poll(() => position(graph, '7')).toEqual({ x: 450, y: 220 });
  return graph;
}

test('snaps a node into the middle of the gap between two neighbours while it is dragged', async ({ page }) => {
  const graph = await demo(page);

  // 7 (450, 220) goes 3 past the middle of 5 (10..110) and 6 (300..400), 3 below their top
  await drag(page, graph, { x: 500, y: 250 }, { x: 208, y: 333 });

  expect(await position(graph, '7')).toEqual({ x: 155, y: 300 });
  await expect(graph.locator('line.v-alignment-line')).not.toHaveCount(0);
  await page.mouse.up();
  await expect(graph.locator('.v-alignment-line')).toHaveCount(0);
  expect(await position(graph, '7')).toEqual({ x: 155, y: 300 });
});

test('keeps a child off its parent border and snaps it to the parent center', async ({ page }) => {
  const graph = await demo(page);

  // 2 sits at (190, 120) inside the parent at (150, 10), 250 wide: 3 from the left wall is not snapped
  await drag(page, graph, { x: 240, y: 145 }, { x: 203, y: 145 });
  expect((await position(graph, '2')).x).toBe(153);

  // Its center 277 is 2 from the parent center 275
  await moveTo(page, graph, 277, 145);
  expect((await position(graph, '2')).x).toBe(225);
  await page.mouse.up();
});

test('straightens an edge to a connected node', async ({ page }) => {
  const graph = await demo(page);

  // 4 moves down until its target handle is level with the source handle of 2
  await drag(page, graph, { x: 500, y: 100 }, { x: 500, y: 120 });
  await page.mouse.up();

  const handles = await graph.evaluate((root) =>
    ['Node 2', 'Node 4'].map((name, index) => {
      const node = root.querySelector(`[aria-label="${name}"]`)!;
      const side = index === 0 ? 'right' : 'left';
      const box = node.querySelector(`.v-handle[data-v-handle-position="${side}"]`)!.getBoundingClientRect();
      return box.y + box.height / 2;
    }),
  );
  expect(Math.abs(handles[0] - handles[1])).toBeLessThan(0.5);
});

test('moves freely while Alt is held', async ({ page }) => {
  const graph = await demo(page);

  await moveTo(page, graph, 500, 250);
  await page.mouse.down();
  await page.keyboard.down('Alt');
  await moveTo(page, graph, 208, 333);

  expect(await position(graph, '7')).toEqual({ x: 158, y: 303 });
  await expect(graph.locator('.v-alignment-line')).toHaveCount(0);
  await page.keyboard.up('Alt');
  await page.mouse.up();
});
