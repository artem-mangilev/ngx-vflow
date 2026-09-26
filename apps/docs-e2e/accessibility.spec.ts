import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const DRAFT_INSTRUCTIONS =
  'Press Enter or Space to select. Use arrow keys to move it while it is selected. Press Delete or Backspace to delete.';

async function open(page: Page) {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('accessibility-demo');
  const graph = demo.getByRole('region', { name: 'Approval graph', exact: true });
  await expect(graph).toBeVisible();
  return { demo, graph, live: demo.locator('[aria-live="polite"]') };
}

async function relativePosition(node: Locator) {
  return node.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const graph = element.closest('[role="region"]')!.getBoundingClientRect();
    return { x: rect.x - graph.x, y: rect.y - graph.y };
  });
}

test('names entities, describes their state, keeps handles transparent and follows the language', async ({ page }) => {
  const { demo, graph } = await open(page);
  const draft = graph.getByRole('group', { name: 'Draft', exact: true });
  await expect(draft).toHaveAttribute('aria-roledescription', 'node');
  await expect(draft).toHaveAccessibleDescription(`Parent: Stage. ${DRAFT_INSTRUCTIONS}`);
  const stage = graph.getByRole('group', { name: 'Stage', exact: true });
  await expect(stage).toHaveAttribute('aria-roledescription', 'group');
  // Unselectable and unselected: the keys cannot select it, so movement is not promised either.
  await expect(stage).toHaveAccessibleDescription(
    'Selection unavailable. Movement unavailable. Press Delete or Backspace to delete.',
  );
  const edit = graph.getByRole('group', { name: 'Edit route', exact: true });
  await expect(edit).toHaveAttribute('aria-roledescription', 'edge');
  await expect(edit).toHaveAccessibleDescription(
    'Opens the editor. Connection from Draft to Editor. Press Enter or Space to select. Press Delete or Backspace to delete.',
  );
  const handles = graph.locator('[data-vflow-handle-type]');
  expect(await handles.count()).toBeGreaterThan(0);
  for (const handle of await handles.all()) {
    for (const name of ['role', 'aria-label', 'aria-describedby', 'tabindex']) {
      await expect(handle).not.toHaveAttribute(name, /.*/);
    }
  }
  for (const live of await demo.locator('[aria-live]').all()) await expect(live).toBeEmpty();
  expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
    [],
  );
  await demo.getByRole('button', { name: 'Switch graph language' }).click();
  const spanish = demo.getByRole('region', { name: 'Grafo de aprobación', exact: true });
  await expect(spanish).toBeVisible();
  await expect(spanish.getByRole('group', { name: 'Draft', exact: true })).toHaveAccessibleDescription(
    'Padre: Stage. Pulse Enter or Space para seleccionar. Use arrow keys para moverlo mientras está seleccionado. Pulse Delete or Backspace para eliminar.',
  );
  await expect(spanish.getByRole('group', { name: 'Stage', exact: true })).toHaveAttribute(
    'aria-roledescription',
    'grupo',
  );
});

test('traverses nodes, controls and edges, selects, moves, announces, deletes and leaves the graph', async ({
  page,
}) => {
  const { demo, graph, live } = await open(page);
  const draft = graph.getByRole('group', { name: 'Draft', exact: true });
  const editor = graph.getByRole('group', { name: 'Editor', exact: true });
  const later = graph.getByRole('group', { name: 'Later', exact: true });
  const next = graph.getByRole('group', { name: 'Next step', exact: true });
  const edit = graph.getByRole('group', { name: 'Edit route', exact: true });
  await demo.getByRole('button', { name: 'Switch graph language' }).focus();
  await page.keyboard.press('Tab');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveCSS('outline-style', 'solid');
  await expect(demo.getByTestId('focused')).toHaveText(`Draft, node. Parent: Stage. ${DRAFT_INSTRUCTIONS}`);
  await page.keyboard.press('Enter');
  await expect(live).toHaveText('Draft selected. 1 selected in total.');
  await expect(demo.getByTestId('announced')).toHaveText('Draft selected. 1 selected in total.');
  const before = await relativePosition(draft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await relativePosition(draft)).x).toBeCloseTo(before.x + 5);
  await expect(live).toHaveText('Moved node right. Position: 35, 40.');
  await page.keyboard.press('Shift+ArrowDown');
  await expect.poll(async () => (await relativePosition(draft)).y).toBeCloseTo(before.y + 20);
  await page.keyboard.press('Tab');
  await expect(graph.getByRole('group', { name: 'Stage', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(editor).toBeFocused();
  const modifier = await page.evaluate(() => (/Macintosh/i.test(navigator.userAgent) ? 'Meta' : 'Control'));
  await page.keyboard.press(`${modifier}+Enter`);
  await expect(live).toHaveText('Editor selected. 2 selected in total.');
  // Embedded controls keep their keys and their Tab stops.
  await page.keyboard.press('Tab');
  const input = graph.getByRole('textbox', { name: 'Node title' });
  await expect(input).toBeFocused();
  await page.keyboard.type('Hello world');
  await page.keyboard.press('ArrowLeft');
  await expect(input).toHaveValue('Hello world');
  await expect(live).toHaveText('Editor selected. 2 selected in total.');
  await page.keyboard.press('Tab');
  await expect(graph.getByRole('button', { name: 'Remove editor' })).toBeFocused();
  // A fully offscreen node is centered when focus reaches it; an edge never pans.
  await page.keyboard.press('Tab');
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
  await expect(next).toBeFocused();
  await expect(viewport).toHaveAttribute('style', transform!);
  await page.keyboard.press('Tab');
  await expect(edit).toBeFocused();
  await expect(edit.locator('.focus-indicator')).toHaveCSS('display', 'block');
  await page.keyboard.press('Escape');
  await expect(live).toHaveText('Selection cleared.');
  // Deleting the focused unselected edge removes only it, and focus recovers on a neighbor.
  await page.keyboard.press('Delete');
  await expect(edit).toHaveCount(0);
  await expect(next).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(later).toBeFocused();
  // Tab leaves the graph normally; there is no focus trap.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(graph.locator(':focus')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
    [],
  );
});

test('recovers focus when an embedded control removes its node', async ({ page }) => {
  const { demo } = await open(page);
  await demo.getByRole('button', { name: 'Switch graph language' }).focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  await expect(demo.getByRole('button', { name: 'Remove editor' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('group', { name: 'Editor', exact: true })).toHaveCount(0);
  await expect(demo.getByRole('group', { name: 'Later', exact: true })).toBeFocused();
});

test('pans, zooms and fits the viewport from the keyboard', async ({ page }) => {
  const { graph, live } = await open(page);
  const viewport = graph.locator('.vflow-viewport');
  const transform = () => viewport.evaluate((element) => element.style.transform);
  await graph.getByRole('group', { name: 'Next step', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(transform).toBe('translate(-15px, 0px) scale(1)');
  await page.keyboard.press('Shift+ArrowDown');
  await expect.poll(transform).toBe('translate(-15px, -60px) scale(1)');
  // A focused unselected node pans as well; a selected movable node moves instead.
  const draft = graph.getByRole('group', { name: 'Draft', exact: true });
  await draft.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(transform).toBe('translate(0px, -60px) scale(1)');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(transform).toBe('translate(0px, -60px) scale(1)');
  await expect(live).toHaveText('Moved node left. Position: 25, 40.');
  await page.keyboard.press('Equal');
  await expect.poll(transform).toMatch(/scale\(1\.2\)$/);
  await expect(live).toHaveText('Zoom 120%.');
  await page.keyboard.press('Digit0');
  await expect.poll(transform).not.toMatch(/scale\(1\.2\)$/);
  await expect(live).toHaveText(/^Zoom \d+%\.$/);
  await expect(live).not.toHaveText('Zoom 120%.');
  // Browser zoom shortcuts and keys from embedded controls are left alone.
  const fitted = await transform();
  await page.keyboard.press('Control+Equal');
  await graph.getByRole('textbox', { name: 'Node title' }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Minus');
  await expect.poll(transform).toBe(fitted);
});

test('zooms from a layout that puts plus and minus on other physical keys', async ({ page }) => {
  const { graph } = await open(page);
  const viewport = graph.locator('.vflow-viewport');
  const zoom = () =>
    viewport.evaluate((element) => Number((element as HTMLElement).style.getPropertyValue('--vflow-zoom')));
  // A German layout reaches + on BracketRight and - on Slash; the binding names the character, not the position.
  const press = (detail: { key: string; code: string }) =>
    page.evaluate(
      (init) =>
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true }),
        ),
      detail,
    );
  await graph.getByRole('group', { name: 'Draft', exact: true }).focus();
  await press({ key: '+', code: 'BracketRight' });
  await expect.poll(zoom).toBeGreaterThan(1.1);
  await press({ key: '-', code: 'Slash' });
  await expect.poll(zoom).toBeLessThan(1.1);
});
