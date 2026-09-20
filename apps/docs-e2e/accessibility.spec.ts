import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('reads default and custom graphs, preserves controls and keeps handles transparent', async ({ page }) => {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('accessibility-demo');
  const graph = demo.getByRole('region', { name: 'Review graph', exact: true });
  await expect(graph.getByRole('group', { name: 'Request', exact: true })).toHaveAccessibleDescription(
    /^Needs approval\. Parent: Review\. Selected\. Selection unavailable\. Movement unavailable\./,
  );
  await expect(graph.getByRole('group', { name: 'Archive route', exact: true })).toHaveAccessibleDescription(
    /^Keep a copy\. Connection from Request to Archive Selected\. Selection unavailable\. Reconnection unavailable\./,
  );
  await expect(graph.getByRole('img', { name: 'Graph minimap' })).toHaveCount(1);
  // The graph advertises its keys once, on the container rather than on every Tab stop.
  await expect(graph).toHaveAttribute('aria-keyshortcuts', /Enter Space Escape Delete Backspace/);
  await expect(graph.getByRole('group', { name: 'Request', exact: true })).not.toHaveAttribute(
    'aria-keyshortcuts',
    /.*/,
  );
  const handles = graph.locator('[data-vflow-handle-type]');
  expect(await handles.count()).toBeGreaterThan(0);
  for (const handle of await handles.all()) {
    for (const name of ['role', 'aria-label', 'aria-describedby', 'tabindex']) {
      await expect(handle).not.toHaveAttribute(name, /.*/);
    }
  }
  const button = graph.getByRole('button', { name: 'Review request' });
  await demo.getByRole('button', { name: 'Switch graph language' }).focus();
  for (let step = 0; step < 4; step++) await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByText('Reviews: 1.', { exact: false })).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
    [],
  );

  // A pointer connection between transparent handles still works and stays axe-clean while connecting.
  const source = graph.locator('[data-vflow-handle-type="source"]').first();
  const target = graph.locator('[data-port="incoming"]');
  const start = (await source.boundingBox())!;
  const end = (await target.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 });
  await expect(target).toHaveAttribute('data-vflow-handle-state', 'valid');
  expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
    [],
  );
  await page.mouse.up();
  await expect(demo.getByText('Accepted connections: 1.', { exact: false })).toBeVisible();

  await expect(demo.locator('[aria-live="polite"]')).toHaveCount(2);
  for (const live of await demo.locator('[aria-live]').all()) await expect(live).toBeEmpty();
  await demo.getByRole('button', { name: 'Switch graph language' }).click();
  await expect(demo.getByRole('region', { name: 'Граф проверки' })).toBeVisible();
  await expect(demo.getByRole('region', { name: 'Reference graph' })).toBeVisible();
  await expect(demo.getByRole('group', { name: 'Request', exact: true })).toHaveAccessibleDescription(
    /Родитель: Review\. Выбран\. Выбор недоступен\. Перемещение недоступно\./,
  );
});
