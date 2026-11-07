import { expect, test } from '@playwright/test';

test('a parent grows around a child dragged past its side and keeps its other children in place', async ({ page }) => {
  await page.goto('/packages/auto-size');

  const flow = page.locator('vflow').first();
  await expect(flow.locator('[data-v-node]')).toHaveCount(6);
  const squad = flow.locator('[data-v-node="squad"]');
  const team = flow.locator('[data-v-node="team"]');
  const dev1 = flow.locator('[data-v-node="dev-1"]');
  const dev2 = flow.locator('[data-v-node="dev-2"]');

  const squadBefore = (await squad.boundingBox())!;
  const teamBefore = (await team.boundingBox())!;
  const dev1Before = (await dev1.boundingBox())!;

  // Drag Dev 2 to the right, past the squad and then past the team.
  const box = (await dev2.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  // Auto-pan may have moved the viewport while the node was near the edge of the pane, so positions are compared
  // relative to the team, which never moves.
  const squadAfter = (await squad.boundingBox())!;
  const teamAfter = (await team.boundingBox())!;
  const dev1After = (await dev1.boundingBox())!;
  expect(squadAfter.width).toBeGreaterThan(squadBefore.width + 100);
  expect(teamAfter.width).toBeGreaterThan(teamBefore.width + 50);
  expect(squadAfter.x - teamAfter.x).toBeCloseTo(squadBefore.x - teamBefore.x, 0);
  expect(squadAfter.y - teamAfter.y).toBeCloseTo(squadBefore.y - teamBefore.y, 0);
  expect(dev1After.x - teamAfter.x).toBeCloseTo(dev1Before.x - teamBefore.x, 0);
  expect(dev1After.y - teamAfter.y).toBeCloseTo(dev1Before.y - teamBefore.y, 0);
});
