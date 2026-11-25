import { expect, test } from './fixtures';

test('the landing page shows the brand name in its logo', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('logo-text')).toHaveText('vflow');
});
