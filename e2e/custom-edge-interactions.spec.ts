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

async function hitTargetAtMidpoint(path: import('@playwright/test').Locator) {
  const point = await midpoint(path);

  return path.evaluate((_, screenPoint) => {
    return document.elementFromPoint(screenPoint.x, screenPoint.y)?.getAttribute('class');
  }, point);
}

test('custom edge interaction stroke can select without blocking empty canvas', async ({ page }) => {
  await page.goto('/edges/custom-edges');

  const interactionPath = page.locator('vflow svg[edge] path.interactive-edge').first();
  await expect(interactionPath).toBeAttached();
  await interactionPath.scrollIntoViewIfNeeded();

  await expect.poll(() => hitTargetAtMidpoint(interactionPath)).toContain('interactive-edge');

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
    .toContain('vflow-pane');

  const point = await midpoint(interactionPath);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('vflow g[customTemplateEdge] path[stroke="#0f4c75"]')).toHaveCount(1);
});

test('custom edge can be selected and deleted by clicking its interaction stroke', async ({ page }) => {
  await page.goto('/cookbook/delete-selected');

  const customEdges = page.locator('vflow g[customTemplateEdge]');
  const customEdge = customEdges.first();
  const interactionPath = customEdge.locator('path.interactive-edge');
  await interactionPath.scrollIntoViewIfNeeded();

  await expect(page.locator('vflow g[customTemplateEdge] path[stroke="#0f4c75"]')).toHaveCount(0);
  await expect.poll(() => hitTargetAtMidpoint(interactionPath)).toContain('interactive-edge');
  const point = await midpoint(interactionPath);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('vflow g[customTemplateEdge] path[stroke="#0f4c75"]')).toHaveCount(1);

  await page.keyboard.press('Backspace');
  await expect(customEdges).toHaveCount(1);
});
