import { expect, test } from '@playwright/test';

// Served from the built packages (dist/libs/*) with the compiled stylesheet and no Tailwind in the consumer.
test('consumer: @vflow/ui and @vflow/ui/bpmn work from the built packages with the compiled CSS', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:4300/');
  const flow = page.getByTestId('ui-flow');
  await expect(flow.locator('article.vui-node')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(flow.locator('article.vui-node')).toHaveCSS('border-radius', '12px');
  await expect(flow.locator('.vui-bpmn-task')).toHaveCSS('border-top-color', 'rgb(25, 38, 56)');
  await expect(flow.locator('.vui-status[data-busy="true"]')).toHaveCSS('color', 'rgb(22, 101, 52)');
  await expect(flow.locator('path.vui-edge')).toHaveCSS('stroke', 'rgb(86, 101, 121)');
  await expect(flow.locator('marker polyline')).toHaveCSS('fill', 'rgb(86, 101, 121)');
  await expect(page.getByRole('group', { name: 'Viewport controls' })).toBeVisible();
  await flow.getByRole('button', { name: 'Theme', exact: true }).click();
  await expect(flow.locator('article.vui-node')).toHaveCSS('background-color', 'rgb(27, 40, 59)');
  await expect(flow.locator('.vflow-root')).toHaveCSS('background-color', 'rgb(16, 24, 39)');
  expect(errors).toEqual([]);
});
