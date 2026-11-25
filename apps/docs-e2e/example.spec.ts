import { expect, test } from './fixtures';

test('the landing page shows the logo as a link to the home page', async ({ page }) => {
  await page.goto('/');

  // The word is drawn in the image, so the link carries the name; the image itself has to load.
  const logo = page.getByRole('link', { name: 'vflow, home' }).locator('img:visible');
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});
