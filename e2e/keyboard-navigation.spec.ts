import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

test('traverses nested nodes and edges, selects and moves nodes, preserves controls and leaves the graph', async ({
  page,
}) => {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('keyboard-demo');
  const graph = demo.getByRole('region', { name: 'Keyboard graph' });
  const draft = graph.getByRole('group', { name: 'Draft', exact: true });
  const editor = graph.getByRole('group', { name: 'Editor', exact: true });
  await demo.getByRole('button', { name: 'Before graph' }).focus();
  await page.keyboard.press('Tab');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveCSS('outline-style', 'solid');
  await expect(demo.getByText('Selected: none', { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  const before = await relativePosition(draft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await relativePosition(draft)).x).toBeCloseTo(before.x + 5);
  await page.keyboard.press('Shift+ArrowDown');
  await expect.poll(async () => (await relativePosition(draft)).y).toBeCloseTo(before.y + 20);
  await page.keyboard.press('Tab');
  await expect(graph.getByRole('group', { name: 'Stage', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByText('Selected: draft', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(editor).toBeFocused();
  const modifier = await page.evaluate(() => (/Macintosh/i.test(navigator.userAgent) ? 'Meta' : 'Control'));
  await page.keyboard.press(`${modifier}+Enter`);
  await expect(demo.getByText('Selected: draft, editor', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  const input = graph.getByRole('textbox', { name: 'Node title' });
  await expect(input).toBeFocused();
  await page.keyboard.type('Hello world');
  await page.keyboard.press('ArrowLeft');
  await expect(input).toHaveValue('Hello world');
  await expect(demo.getByText('Selected: draft, editor', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(graph.getByRole('button', { name: 'Remove editor' })).toBeFocused();
  await page.keyboard.press('Tab');
  const later = graph.getByRole('group', { name: 'Later', exact: true });
  await expect(later).toBeFocused();
  await expect
    .poll(async () => {
      const node = (await later.boundingBox())!;
      const pane = (await graph.boundingBox())!;
      return node.x + node.width / 2 - pane.x - pane.width / 2;
    })
    .toBeCloseTo(0);
  const viewport = graph.locator('.vflow-viewport');
  const transform = await viewport.getAttribute('style');
  await page.keyboard.press('Tab');
  await expect(graph.getByRole('group', { name: 'Next step', exact: true })).toBeFocused();
  await expect(viewport).toHaveAttribute('style', transform!);
  await page.keyboard.press('Tab');
  const customEdge = graph.getByRole('group', { name: 'Edit route', exact: true });
  await expect(customEdge).toBeFocused();
  await expect(customEdge.locator('.focus-indicator')).toHaveCSS('display', 'block');
  await page.keyboard.press('Escape');
  await expect(demo.getByText('Selected: none', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(demo.getByRole('button', { name: 'After graph' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(customEdge).toBeFocused();
  expect((await new AxeBuilder({ page }).include('[data-testid="keyboard-demo"]').analyze()).violations).toEqual([]);
});

test('recovers focus when an embedded control removes its node', async ({ page }) => {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('keyboard-demo');
  await demo.getByRole('button', { name: 'Before graph' }).focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  await expect(demo.getByRole('button', { name: 'Remove editor' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('group', { name: 'Editor', exact: true })).toHaveCount(0);
  await expect(demo.getByRole('group', { name: 'Later', exact: true })).toBeFocused();
});

test('uses grid steps and manual selection and independently disables focus auto-pan', async ({ page }) => {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('keyboard-demo');
  const draft = demo.getByRole('group', { name: 'Draft', exact: true });
  await demo.getByLabel('Snap to grid', { exact: true }).check();
  await demo.getByRole('button', { name: 'Before graph' }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  const before = await relativePosition(draft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await relativePosition(draft)).x).toBeCloseTo(before.x + 20);
  await page.keyboard.press('Shift+ArrowRight');
  await expect.poll(async () => (await relativePosition(draft)).x).toBeCloseTo(before.x + 100);
  await demo.getByLabel('Application owns selection').check();
  await draft.focus();
  await page.keyboard.press('Escape');
  await expect(demo.getByText('Selected: draft', { exact: true })).toBeVisible();
  await demo.getByLabel('Pan on node focus').uncheck();
  const viewport = demo.locator('.vflow-viewport');
  const transform = await viewport.getAttribute('style');
  await demo.getByRole('button', { name: 'Before graph' }).focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  await expect(demo.getByRole('group', { name: 'Later', exact: true })).toBeFocused();
  await expect(viewport).toHaveAttribute('style', transform!);
  await expect.poll(() => demo.getByRole('region', { name: 'Keyboard graph' }).evaluate((el) => el.scrollLeft)).toBe(0);
});

async function relativePosition(node: Locator) {
  return node.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const graph = element.closest('[role="region"]')!.getBoundingClientRect();
    return { x: rect.x - graph.x, y: rect.y - graph.y };
  });
}
