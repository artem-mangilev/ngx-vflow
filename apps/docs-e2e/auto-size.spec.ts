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
  const squad = flow.locator('[data-v-node="squad"]');
  const team = flow.locator('[data-v-node="team"]');
  const dev1 = flow.locator('[data-v-node="dev-1"]');
  const dev2 = flow.locator('[data-v-node="dev-2"]');

  const before = { squad: await flowPoint(squad), team: await flowPoint(team), dev1: await flowPoint(dev1) };
  const squadBefore = (await squad.boundingBox())!;
  const teamBefore = (await team.boundingBox())!;
  const unit = (await dev1.boundingBox())!.width;

  // Drag Dev 2 to the right, past the squad and then past the team.
  const box = (await dev2.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  // Widths in flow units: the width of Dev 1, 100 flow units, gives the zoom.
  const zoom = (await dev1.boundingBox())!.width / 100;
  const squadAfter = (await squad.boundingBox())!;
  const teamAfter = (await team.boundingBox())!;
  expect(squadAfter.width / zoom).toBeGreaterThan(squadBefore.width / (unit / 100) + 100);
  expect(teamAfter.width / zoom).toBeGreaterThan(teamBefore.width / (unit / 100) + 50);
  // The parents and the other child stay where they were.
  expect(await flowPoint(squad)).toEqual(before.squad);
  expect(await flowPoint(team)).toEqual(before.team);
  expect(await flowPoint(dev1)).toEqual(before.dev1);
});
