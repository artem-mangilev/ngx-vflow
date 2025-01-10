import { test, expect } from '@playwright/test';

test('has logo text', async ({ page }) => {
  await page.goto('http://localhost:4200');

  await expect(page.getByTestId('logo-text')).toHaveText('ngx-vflow');
});
