import { expect, test, Locator } from '@playwright/test';

async function geometry(demo: Locator) {
  return demo.evaluate((root) => {
    const pairs = [
      ['customer', 'id', 'order', 'customer-id'],
      ['crm', 'email', 'erp', 'email'],
    ];
    return Math.max(
      ...pairs.flatMap(([s, sh, t, th], i) => {
        const port = (node: string, field: string, side: string) =>
          root
            .querySelector(`[data-entity="${node}"] [data-port-field="${field}"] .handle--${side}`)!
            .getBoundingClientRect();
        const source = port(s, sh, 'right'),
          target = port(t, th, 'left');
        const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[i];
        const matrix = edge.getScreenCTM()!;
        const start = edge.getPointAtLength(0).matrixTransform(matrix);
        const end = edge.getPointAtLength(edge.getTotalLength()).matrixTransform(matrix);
        return [
          Math.abs(start.x - source.right),
          Math.abs(start.y - source.y - source.height / 2),
          Math.abs(end.x - target.left),
          Math.abs(end.y - target.y - target.height / 2),
        ];
      }),
    );
  });
}

test('entity ports survive scroll, collapse, zoom and expansion with stable DOM identity', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/design-system/entities');
  const demo = page.locator('app-ui-entities-demo');
  await expect(demo.locator('path.vui-edge')).toHaveCount(2);
  // Persistent anchors keep ports independent of clipped or collapsed field content.
  await expect(demo.locator('[data-port-field]')).toHaveCount(10);
  await demo.evaluate((root) => {
    root.setAttribute('data-synthetic-scrolls', '0');
    root.addEventListener(
      'scroll',
      (event) => {
        if (!event.isTrusted)
          root.setAttribute('data-synthetic-scrolls', String(Number(root.getAttribute('data-synthetic-scrolls')) + 1));
      },
      true,
    );
  });
  const first = await demo.locator('[data-entity="customer"] [data-port-field="id"] .handle--right').elementHandle();
  await expect.poll(() => geometry(demo)).toBeLessThan(1);
  await demo.getByLabel('Scrollable fields', { exact: true }).check();
  const fields = demo.locator('[data-entity="customer"] .fields');
  const viewport = demo.locator('.vflow-viewport').first();
  const transform = await viewport.getAttribute('style');
  await fields.hover();
  await page.mouse.wheel(0, 100);
  await expect.poll(() => fields.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  await expect(viewport).toHaveAttribute('style', transform!);
  await expect.poll(() => geometry(demo)).toBeLessThan(1);
  const placement = () =>
    demo.locator('[data-entity="customer"]').evaluate((node) => {
      const bounds = node.querySelector('.fields')!.getBoundingClientRect();
      const ys = [...node.querySelectorAll('[data-port-field] .handle--right')].map((e) => {
        const r = e.getBoundingClientRect();
        return r.y + r.height / 2;
      });
      return ys.every((y, i) => y >= bounds.top && y <= bounds.bottom && (!i || y > ys[i - 1] + 1));
    });
  await expect.poll(placement).toBe(true);
  await demo.screenshot({ path: testInfo.outputPath('entities-scroll.png') });
  await demo.getByLabel('Collapse fields', { exact: true }).check();
  await expect.poll(() => geometry(demo)).toBeLessThan(1);
  await expect
    .poll(() =>
      demo.locator('[data-entity="customer"]').evaluate((node) => {
        const header = node.querySelector('header')!.getBoundingClientRect();
        return [...node.querySelectorAll('[data-port-field] .handle')].every((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.y >= header.top && r.bottom <= header.bottom;
        });
      }),
    )
    .toBe(true);
  await demo.screenshot({ path: testInfo.outputPath('entities-collapsed.png') });
  await demo.getByRole('button', { name: 'Fit entities', exact: true }).click();
  await expect.poll(() => geometry(demo)).toBeLessThan(1);
  await demo.getByLabel('Collapse fields', { exact: true }).uncheck();
  await demo.getByLabel('Scrollable fields', { exact: true }).uncheck();
  await demo.getByLabel('Compact', { exact: true }).check();
  await demo.getByRole('button', { name: 'Reverse fields', exact: true }).click();
  await expect.poll(() => geometry(demo)).toBeLessThan(1);
  expect(await first!.evaluate((e) => e.isConnected)).toBe(true);
  await expect(demo).toHaveAttribute('data-synthetic-scrolls', '0');
  expect(errors).toEqual([]);
});
