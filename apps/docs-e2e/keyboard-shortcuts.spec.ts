import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('follows a rebound key in the shortcut configuration example', async ({ page }) => {
  await page.goto('/docs/interactions/keyboard-shortcuts');
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
});

test.describe('accessibility', () => {
  // The flows fade in; axe samples the contrast of a fading element wrongly.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('the shortcut configuration example has no axe violations', async ({ page }) => {
    await page.goto('/docs/interactions/keyboard-shortcuts');
    await expect(page.getByTestId('shortcuts-config')).toContainText('Backspace');
    const results = await new AxeBuilder({ page }).include('[data-testid="shortcuts-demo"]').analyze();
    expect(results.violations).toEqual([]);
  });
});
