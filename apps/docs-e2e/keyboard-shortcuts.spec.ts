import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('follows a rebound key in the shortcut configuration example', async ({ page }) => {
  await page.goto('/interactions/keyboard-shortcuts');
  const demo = page.getByTestId('shortcuts-demo');
  const graph = demo.getByRole('region', { name: 'Configured graph', exact: true });
  const config = demo.getByTestId('shortcuts-config');
  await expect(config).toContainText('Backspace');
  // The default key deletes the focused node.
  await graph.getByRole('group', { name: 'Draft', exact: true }).focus();
  await page.keyboard.press('Delete');
  await expect(demo.getByText('Deletion requests: 1.', { exact: false })).toBeVisible();
  await expect(graph.getByRole('group', { name: 'Draft', exact: true })).toHaveCount(0);
  // Rebinding the command rewrites the configuration and moves the behavior to the new key.
  await demo.getByLabel('Delete command').selectOption('x');
  await expect(config).not.toContainText('Backspace');
  await graph.getByRole('group', { name: 'Review', exact: true }).focus();
  await page.keyboard.press('Delete');
  await expect(demo.getByText('Deletion requests: 1.', { exact: false })).toBeVisible();
  await page.keyboard.press('x');
  await expect(demo.getByText('Deletion requests: 2.', { exact: false })).toBeVisible();
  await expect(graph.getByRole('group', { name: 'Review', exact: true })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include('[data-testid="shortcuts-demo"]').analyze()).violations).toEqual([]);
});
