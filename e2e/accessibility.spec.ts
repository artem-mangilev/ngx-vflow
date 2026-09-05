import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('reads default and custom graphs, preserves controls and describes only the current connection candidate', async ({
  page,
}) => {
  await page.goto('/interactions/accessibility');
  const demo = page.getByTestId('accessibility-demo');
  const graph = demo.getByRole('region', { name: 'Review graph', exact: true });
  const target = graph.getByRole('group', { name: 'Accept request', exact: true });
  await expect(graph.getByRole('group', { name: 'Request', exact: true })).toHaveAccessibleDescription(
    'Needs approval. Parent: Review. Selected. Selection unavailable. Movement unavailable.',
  );
  await expect(graph.getByRole('group', { name: 'Archive route', exact: true })).toHaveAccessibleDescription(
    'Keep a copy. Connection from Request to Archive Selected. Selection unavailable. Reconnection unavailable.',
  );
  await expect(target).toHaveAccessibleDescription('Inbound route. Starting connections unavailable.');
  await expect(graph.getByRole('img', { name: 'Graph minimap' })).toHaveCount(1);
  const button = graph.getByRole('button', { name: 'Review request' });
  await demo.getByRole('button', { name: 'Switch graph language' }).focus();
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByText('Reviews: 1.', { exact: false })).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
    [],
  );

  const source = graph.getByRole('group', { name: 'Source connection point of Request', exact: true });
  for (const valid of [true, false]) {
    if (!valid) await demo.getByLabel('Connection passes validation').uncheck();
    const start = (await source.boundingBox())!;
    const end = (await target.boundingBox())!;
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 });
    await expect(target).toHaveAccessibleDescription(
      `Inbound route. Starting connections unavailable. ${valid ? 'Valid' : 'Invalid'} connection target.`,
    );
    expect((await new AxeBuilder({ page }).include('[data-testid="accessibility-demo"]').analyze()).violations).toEqual(
      [],
    );
    await page.mouse.up();
    await expect(target).toHaveAccessibleDescription('Inbound route. Starting connections unavailable.');
  }
  await demo.getByLabel('Allow incoming connections').uncheck();
  await expect(target).toHaveAccessibleDescription(
    'Inbound route. Starting connections unavailable. Accepting connections unavailable.',
  );
  await expect(demo.locator('[aria-live="polite"]')).toHaveCount(2);
  for (const live of await demo.locator('[aria-live]').all()) await expect(live).toBeEmpty();
  await demo.getByRole('button', { name: 'Switch graph language' }).click();
  await expect(demo.getByRole('region', { name: 'Граф проверки' })).toBeVisible();
  await expect(demo.getByRole('region', { name: 'Reference graph' })).toBeVisible();
  await expect(demo.getByRole('group', { name: 'Accept request', exact: true })).toHaveAccessibleDescription(
    'Inbound route. Начало соединения недоступно. Приём соединения недоступен.',
  );
});
