import { test, expect } from '@playwright/test';

test('declared marker shapes render in the shared defs and edges reference them like built-in markers', async ({
  page,
}) => {
  await page.goto('/edges/markers');
  const demo = page.locator('vflow').filter({ has: page.locator('marker.vflow-marker--diamond') });
  const defs = demo.locator('defs[flowDefs]').first();

  await expect(defs.locator('marker.vflow-marker--diamond polygon')).toHaveCount(1);
  await expect(defs.locator('marker.vflow-marker--circle-closed circle')).toHaveCount(1);
  await expect(defs.locator('marker.vflow-marker--bar line')).toHaveCount(1);

  // The edge from the bar to the diamond references the marker elements of both shapes by id.
  const ids = await defs.evaluate((element) => ({
    bar: element.querySelector('marker.vflow-marker--bar')!.id,
    diamond: element.querySelector('marker.vflow-marker--diamond')!.id,
  }));
  const edge = demo.locator(`svg[edge] path[marker-start="url(#${ids.bar})"]`).first();
  await expect(edge).toHaveAttribute('marker-end', `url(#${ids.diamond})`);
  await expect(defs.locator('marker.vflow-marker--diamond')).toHaveAttribute('refX', '-8');
  await expect(defs.locator('marker.vflow-marker--diamond')).toHaveAttribute('stroke', 'context-stroke');
});
