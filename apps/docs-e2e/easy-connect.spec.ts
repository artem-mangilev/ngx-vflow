import { center, expect, pathPoint, test, type Locator, type Page, type Point } from './fixtures';

async function open(page: Page) {
  await page.goto('/examples/recipes/easy-connect');
  const flow = page.locator('vflow');
  await flow.scrollIntoViewIfNeeded();
  const card = (id: string) => flow.locator(`[data-v-node="${id}"]`).getByTestId('easy-node');
  const edges = flow.locator('[data-v-edge]');
  const start = () => pathPoint(flow.locator('[data-v-edge="idea-draft"] [data-v-interactive-edge]'), 0);
  await expect(edges).toHaveCount(1);
  return { flow, card, edges, start };
}

/** Distance from a client point inside an element to its nearest border; Infinity outside. */
async function distanceToBorder(locator: Locator, point: Point) {
  const box = (await locator.boundingBox())!;
  const inside = point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;
  const toSides = [point.x - box.x, box.x + box.width - point.x, point.y - box.y, box.y + box.height - point.y];
  return inside ? Math.min(...toSides) : Infinity;
}

test('an edge starts on the middle of the border of its source that faces the target', async ({ page }) => {
  const { card, start } = await open(page);

  // The layout settles after the edge appears: read the geometry until it holds.
  await expect(async () => {
    const point = await start();
    const source = await center(card('idea'));
    expect(await distanceToBorder(card('idea'), point)).toBeLessThan(2);
    expect(Math.abs(point.y - source.y)).toBeLessThan(2);
  }).toPass();
});

test('a press anywhere on the body of a node connects it to the node it is released on', async ({ page }) => {
  const { card, edges } = await open(page);
  const from = await center(card('draft').getByTestId('easy-node-body'));
  const to = await center(card('review').getByTestId('easy-node-body'));

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 30, from.y + 30, { steps: 4 });
  await expect(card('draft')).toHaveAttribute('data-v-handle-state', 'connecting');
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await expect(card('review')).toHaveAttribute('data-v-handle-state', 'valid');
  await page.mouse.up();

  await expect(edges).toHaveCount(2);
  await expect(card('draft')).toHaveAttribute('data-v-handle-state', 'idle');
});

test('the title of a node drags it', async ({ page }) => {
  const { card } = await open(page);
  const before = (await card('idea').boundingBox())!;
  const title = await center(card('idea').getByTestId('easy-node-title'));

  await page.mouse.move(title.x, title.y);
  await page.mouse.down();
  await page.mouse.move(title.x + 60, title.y + 40, { steps: 6 });
  await page.mouse.up();

  await expect.poll(async () => (await card('idea').boundingBox())!.x - before.x).toBeGreaterThan(40);
  expect((await card('idea').boundingBox())!.y - before.y).toBeGreaterThan(20);
});

test('with position center an edge starts at the center of its source', async ({ page }) => {
  const { card, start } = await open(page);

  await page.getByLabel('Edges meet nodes at').selectOption('center');

  await expect(async () => {
    const point = await start();
    const source = await center(card('idea'));
    expect(Math.abs(point.x - source.x)).toBeLessThan(2);
    expect(Math.abs(point.y - source.y)).toBeLessThan(2);
  }).toPass();
});

test('a custom curve keeps the endpoint on the border and slides it towards the target', async ({ page }) => {
  const { card, start } = await open(page);

  await page.getByLabel('Edges meet nodes at').selectOption('crossing');

  await expect(async () => {
    const point = await start();
    const source = await center(card('idea'));
    expect(await distanceToBorder(card('idea'), point)).toBeLessThan(2);
    expect(Math.abs(point.y - source.y)).toBeGreaterThan(4);
  }).toPass();
});
