import { expect, test } from '@playwright/test';

async function midpoint(path: import('@playwright/test').Locator) {
  return path.evaluate((element: SVGPathElement) => {
    const matrix = element.getScreenCTM();

    if (!matrix) {
      throw new Error('Expected the custom edge interaction path to have a screen transform');
    }

    const point = element.getPointAtLength(element.getTotalLength() / 2).matrixTransform(matrix);

    return { x: point.x, y: point.y };
  });
}

// Locator clicks wait for a stable path and retry hit testing while the docs layout settles.
async function clickMidpoint(path: import('@playwright/test').Locator) {
  const point = await midpoint(path);
  const bounds = (await path.boundingBox())!;
  await path.click({ position: { x: point.x - bounds.x, y: point.y - bounds.y } });
}

async function hitTargetAtMidpoint(path: import('@playwright/test').Locator) {
  const point = await midpoint(path);

  return path.evaluate((_, screenPoint) => {
    return document.elementFromPoint(screenPoint.x, screenPoint.y)?.hasAttribute('data-v-interactive-edge') ?? false;
  }, point);
}

test('custom edge interaction stroke can select without blocking empty canvas', async ({ page }) => {
  await page.goto('/docs/edges/rendering');

  // The page opens with the plain edge demo; the edge template demo is the second flow.
  const flow = page.locator('vflow').nth(1);
  const interactionPath = flow.locator('svg[edge] path[data-v-interactive-edge]').first();
  await expect(interactionPath).toBeAttached();
  await interactionPath.scrollIntoViewIfNeeded();

  await expect.poll(() => hitTargetAtMidpoint(interactionPath)).toBe(true);

  await expect
    .poll(() =>
      interactionPath.evaluate((path: SVGPathElement) => {
        const matrix = path.getScreenCTM();

        if (!matrix) {
          return null;
        }

        const length = path.getTotalLength();
        const before = path.getPointAtLength(length / 2 - 1).matrixTransform(matrix);
        const midpoint = path.getPointAtLength(length / 2).matrixTransform(matrix);
        const after = path.getPointAtLength(length / 2 + 1).matrixTransform(matrix);
        const tangentX = after.x - before.x;
        const tangentY = after.y - before.y;
        const tangentLength = Math.hypot(tangentX, tangentY);
        const outsideStroke = new DOMPoint(
          midpoint.x - (tangentY / tangentLength) * 30,
          midpoint.y + (tangentX / tangentLength) * 30,
        );

        return document.elementFromPoint(outsideStroke.x, outsideStroke.y)?.getAttribute('class');
      }),
    )
    .toContain('v-pane');

  await expect(flow.locator('[data-v-edge][data-v-selected]')).toHaveCount(0);
  await clickMidpoint(interactionPath);
  await expect(flow.locator('[data-v-edge][data-v-selected]')).toHaveCount(1);
});

test('an edge can be selected by clicking its interaction stroke and deleted from the keyboard', async ({ page }) => {
  await page.goto('/docs/interactions/deleting');

  const edges = page.locator('vflow svg[edge]');
  const selected = page.locator('vflow svg[edge][data-v-selected]');
  const interactionPath = edges.first().locator('path[data-v-interactive-edge]');
  await interactionPath.scrollIntoViewIfNeeded();

  await expect(edges).toHaveCount(3);
  await expect(selected).toHaveCount(0);
  await expect.poll(() => hitTargetAtMidpoint(interactionPath)).toBe(true);
  await clickMidpoint(interactionPath);
  await expect(selected).toHaveCount(1);

  await edges.first().focus();
  await page.keyboard.press('Backspace');
  await expect(edges).toHaveCount(2);
  await expect(page.getByText('Removed 0 nodes and 1 edge.')).toBeVisible();

  // The application owns the graph, so it can bring the removed edge back.
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(edges).toHaveCount(3);
});
