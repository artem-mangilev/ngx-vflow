import { expect, test } from '@playwright/test';

test('NgDoc uses the UI package and flow engine together', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/introduction/design-system');
  const button = page.getByRole('button', { name: 'Fit graph', exact: true });
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('border-radius', '6px');
  await expect(button).toHaveCSS('padding-left', '16px');
  await expect(page.locator('vflow').getByText('ngx-vflow + @vflow/ui', { exact: true })).toBeVisible();
  await button.click();
  await expect(button).toBeFocused();
  expect(errors).toEqual([]);
});
