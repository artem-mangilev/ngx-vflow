import { expect, test } from '@playwright/test';

test('overview renders every edge and measures the resizable card, including its right handle', async ({ page }) => {
  await page.goto('/introduction/overview');
  const flow = page.locator('vflow');
  await expect(flow.locator('svg[edge]')).toHaveCount(6);
  await expect(flow.locator('svg[edge] path.vui-edge')).toHaveCount(6);
  await expect
    .poll(() =>
      flow.locator('.transform-node').evaluate((node) => {
        const card = node.getBoundingClientRect();
        const host = node.closest('.vflow-node')!.getBoundingClientRect();
        const handle = node.querySelector('.handle--right')!.getBoundingClientRect();
        return Math.max(
          Math.abs(card.width - host.width),
          Math.abs(card.height - host.height),
          Math.abs(card.right - handle.x - handle.width / 2),
        );
      }),
    )
    .toBeLessThan(1);
});

test('simple card labels remain centered in both axes', async ({ page }) => {
  await page.goto('/nodes/default-nodes');
  await expect(page.locator('vflow-card-node')).toHaveCount(2);
  const errors = await page.locator('vflow-card-node .vui-node').evaluateAll((cards) =>
    cards.map((card) => {
      const text = [...card.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())!;
      const range = document.createRange();
      range.selectNodeContents(text);
      const label = range.getBoundingClientRect();
      const box = card.getBoundingClientRect();
      return Math.max(
        Math.abs(label.x + label.width / 2 - box.x - box.width / 2),
        Math.abs(label.y + label.height / 2 - box.y - box.height / 2),
      );
    }),
  );
  expect(Math.max(...errors)).toBeLessThan(2);
});

test('labels preserve text and reserve the delete action for its own label', async ({ page }) => {
  await page.goto('/edges/labels');
  const flow = page.locator('vflow');
  for (const text of ['Start', 'End', 'Center Only']) await expect(flow.getByText(text, { exact: true })).toBeVisible();
  await expect(flow.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(1);
});

test('media ports align with positioned content and their SVG endpoints', async ({ page }) => {
  await page.goto('/design-system/pipeline');
  const demo = page.locator('app-ui-pipeline-demo');
  await expect(demo.locator('.vui-port')).toHaveCount(4);
  await expect
    .poll(() =>
      demo.locator('.port-row').evaluateAll((rows) =>
        Math.max(
          ...rows.map((row) => {
            const port = row.querySelector('.vui-port')!.getBoundingClientRect();
            const box = row.getBoundingClientRect();
            const card = row.closest('article')!.getBoundingClientRect();
            const right = !!row.querySelector('.handle--right');
            return Math.max(
              Math.abs(port.y + port.height / 2 - box.y - box.height / 2),
              Math.abs(port.x + port.width / 2 - (right ? card.right : card.left)),
            );
          }),
        ),
      ),
    )
    .toBeLessThan(1);
  await expect
    .poll(() =>
      demo.evaluate((root) => {
        const sources = root.querySelectorAll('.handle--right .vui-port');
        const targets = root.querySelectorAll('.handle--left .vui-port');
        return Math.max(
          ...Array.from(root.querySelectorAll<SVGPathElement>('path.vui-edge')).map((edge, i) => {
            const source = sources[i].getBoundingClientRect();
            const target = targets[i].getBoundingClientRect();
            const matrix = edge.getScreenCTM()!;
            const start = edge.getPointAtLength(0).matrixTransform(matrix);
            const end = edge.getPointAtLength(edge.getTotalLength()).matrixTransform(matrix);
            return Math.max(
              Math.abs(start.x - source.right),
              Math.abs(start.y - source.y - source.height / 2),
              Math.abs(end.x - target.left),
              Math.abs(end.y - target.y - target.height / 2),
            );
          }),
        );
      }),
    )
    .toBeLessThan(1);
});

test('group frames render in every migrated group demo and custom groups keep their own presentation', async ({
  page,
}) => {
  for (const route of [
    '/cookbook/drag-and-drop-nodes',
    '/nodes/resizer',
    '/interactions/keyboard-shortcuts',
    '/viewport/alignment-helper',
    '/interactions/accessibility',
    '/nodes/subflows',
    '/viewport/minimap',
    '/viewport/snap-to-grid',
  ]) {
    await page.goto(route);
    const flow = page.locator('vflow').first();
    await expect(flow.locator('.vui-group').first(), route).toBeVisible();
    await expect
      .poll(
        () =>
          flow
            .locator('.vui-group')
            .first()
            .evaluate((group) => {
              const box = group.getBoundingClientRect();
              return Math.min(box.width, box.height);
            }),
        { message: route },
      )
      .toBeGreaterThan(40);
  }
  await page.goto('/nodes/subflows');
  await expect(page.locator('.group-node')).toHaveCount(1);
  await expect(page.locator('.vui-group')).toHaveCount(1);
});

test('drag-handle demo supplies visible paths for both connections', async ({ page }) => {
  await page.goto('/nodes/draggables');
  await expect(page.locator('vflow').nth(1).locator('path.vui-edge')).toHaveCount(2);
});
