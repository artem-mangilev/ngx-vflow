import { expect, test } from '@playwright/test';

/** Flow-space position of a node, from the transform the flow sets, so pan and zoom do not matter. */
async function flowPoint(node: import('@playwright/test').Locator) {
  return node.evaluate((element: HTMLElement) => {
    const [x, y] = element.style.transform.match(/-?[\d.]+/g)!.map(Number);
    return { x, y };
  });
}

test('a parent grows around a child dragged past its side and keeps its other children in place', async ({ page }) => {
  await page.goto('/packages/auto-size');

  const flow = page.locator('vflow').first();
  await expect(flow.locator('[data-v-node]')).toHaveCount(6);
  await flow.scrollIntoViewIfNeeded();
  const squad = flow.locator('[data-v-node="squad"]');
  const team = flow.locator('[data-v-node="team"]');
  const backend = flow.locator('[data-v-node="backend"]');
  const frontend = flow.locator('[data-v-node="frontend"]');

  const before = { squad: await flowPoint(squad), team: await flowPoint(team), backend: await flowPoint(backend) };
  const squadBefore = (await squad.boundingBox())!;
  const teamBefore = (await team.boundingBox())!;
  const unit = (await backend.boundingBox())!.width;

  // Drag Frontend to the right, past the squad and then past the team.
  const box = (await frontend.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  // Widths in flow units: the width of Backend, 100 flow units, gives the zoom.
  const zoom = (await backend.boundingBox())!.width / 100;
  const squadAfter = (await squad.boundingBox())!;
  const teamAfter = (await team.boundingBox())!;
  expect(squadAfter.width / zoom).toBeGreaterThan(squadBefore.width / (unit / 100) + 100);
  expect(teamAfter.width / zoom).toBeGreaterThan(teamBefore.width / (unit / 100) + 50);
  // The parents and the other child stay where they were.
  expect(await flowPoint(squad)).toEqual(before.squad);
  expect(await flowPoint(team)).toEqual(before.team);
  expect(await flowPoint(backend)).toEqual(before.backend);
});

test('with shrinking on, a parent follows a child back in; turned off, it keeps its size', async ({ page }) => {
  await page.goto('/packages/auto-size');
  const flow = page.locator('vflow').first();
  const squad = flow.locator('[data-v-node="squad"]');
  const frontend = flow.locator('[data-v-node="frontend"]');
  await expect(flow.locator('[data-v-node]')).toHaveCount(6);
  await flow.scrollIntoViewIfNeeded();

  // Short drags: near the edge of the pane auto-pan would move the view, and dragging back would not return the node.
  const drag = async (dx: number) => {
    const box = (await frontend.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
  };
  const width = async () => (await squad.boundingBox())!.width;

  const initial = await width();
  await drag(120);
  const grown = await width();
  expect(grown).toBeGreaterThan(initial + 60);
  await drag(-120);
  expect(await width()).toBeCloseTo(initial, 0);

  await page.getByLabel('Shrink parents to fit').uncheck();
  await drag(120);
  await drag(-120);
  expect(await width()).toBeCloseTo(grown, 0);
});
