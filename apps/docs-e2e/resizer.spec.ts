import { expect, Locator, Page, test } from '@playwright/test';

/** Pixels that layout rounding may add between a node box and the controls or handles drawn around it. */
const TOLERANCE = 1.5;

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('Expected a rendered element');
  return { ...rect, right: rect.x + rect.width, bottom: rect.y + rect.height, centerX: rect.x + rect.width / 2 };
}

function zoomOf(node: Locator) {
  return node.evaluate((element) => {
    const viewport = element.closest<HTMLElement>('.vflow-viewport')!;
    return new DOMMatrixReadOnly(viewport.style.transform).a;
  });
}

function offsetSize(element: Locator) {
  return element.evaluate((el: HTMLElement) => ({ width: el.offsetWidth, height: el.offsetHeight }));
}

async function expectOutline(node: Locator, card: Locator) {
  const cardBox = await box(card);
  const top = await box(node.locator('.resize-control.line.top'));
  const left = await box(node.locator('.resize-control.line.left'));

  expect(Math.abs(top.x - cardBox.x)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(top.width - cardBox.width)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(left.y - cardBox.y)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(left.height - cardBox.height)).toBeLessThanOrEqual(TOLERANCE);
}

/** Distance between the right handle's center and the card's right edge, in screen pixels. */
async function rightHandleOffset(node: Locator, card: Locator) {
  const handle = await box(node.locator('.vflow-handle[data-vflow-handle-position="right"]').first());
  return Math.abs(handle.centerX - (await box(card)).right);
}

async function dragControl(page: Page, control: Locator, dx: number, dy: number) {
  const start = await box(control);
  const x = start.centerX;
  const y = start.y + start.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 10 });
  await page.mouse.up();
}

async function reportedSize(output: Locator) {
  const text = (await output.textContent()) ?? '';
  const match = text.match(/W:\s*(\d+)px\s*H:\s*(\d+)px/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

test.describe('overview resizer', () => {
  let node: Locator;
  let card: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('/introduction/overview');
    node = page.locator('.vflow-node[aria-label="Node transform"]');
    card = node.locator('.transform-node');
    await node.scrollIntoViewIfNeeded();
    await expect(node).toHaveCSS('visibility', 'visible');
    await card.click();
    await expect(node.locator('.resize-control')).toHaveCount(8);
  });

  test('outlines a content-sized node and places its handles on the card edges', async () => {
    await expect(card).not.toHaveAttribute('style', /width/);
    await expectOutline(node, card);
    await expect.poll(() => rightHandleOffset(node, card)).toBeLessThanOrEqual(TOLERANCE);
  });

  test('grows the node, its handles and the reported size by the dragged distance', async ({ page }) => {
    const output = page.locator('.vflow-node[aria-label="Node output-size"]');
    const zoom = await zoomOf(node);
    const before = await offsetSize(card);
    await expect.poll(() => reportedSize(output)).toEqual(before);

    await dragControl(page, node.locator('.resize-control.handle.bottom.right'), 80, 60);

    await expect(card).toHaveAttribute('style', /width: \d+px/);
    const after = await offsetSize(card);
    expect(Math.abs(after.width - before.width - 80 / zoom)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(after.height - before.height - 60 / zoom)).toBeLessThanOrEqual(TOLERANCE);
    await expect.poll(() => reportedSize(output)).toEqual(after);
    await expectOutline(node, card);
    await expect.poll(() => rightHandleOffset(node, card)).toBeLessThanOrEqual(TOLERANCE);
  });
});

test('resizer demo keeps a node at its CSS min-width while shrinking', async ({ page }) => {
  await page.goto('/nodes/resizer');
  const node = page.locator('.vflow-node', { has: page.locator('.custom-node') }).first();
  const card = node.locator('.custom-node');
  const corner = node.locator('.resize-control.handle.bottom.right');
  await node.scrollIntoViewIfNeeded();
  await expect(node).toHaveCSS('visibility', 'visible');
  await expect(node.locator('.resize-control')).toHaveCount(8);

  await expect(card).not.toHaveAttribute('style', /width/);
  await expectOutline(node, card);

  const minWidth = await card.evaluate((el) => parseFloat(getComputedStyle(el).minWidth));
  const zoom = await zoomOf(node);
  // The content-sized card already sits at its min-width, so shrinking changes nothing and the node stays auto.
  expect((await offsetSize(card)).width).toBe(minWidth);
  await dragControl(page, corner, -40 * zoom, 0);
  await expect(card).not.toHaveAttribute('style', /width/);

  await dragControl(page, corner, 60 * zoom, 0);
  await expect(card).toHaveAttribute('style', /width: \d+px/);
  expect(Math.abs((await offsetSize(card)).width - minWidth - 60)).toBeLessThanOrEqual(TOLERANCE);

  await dragControl(page, corner, -200 * zoom, 0);
  await expect(card).toHaveAttribute('style', new RegExp(`width: ${minWidth}px`));
  expect((await offsetSize(card)).width).toBe(minWidth);
  await expectOutline(node, card);
  await expect.poll(() => rightHandleOffset(node, card)).toBeLessThanOrEqual(TOLERANCE);
});
