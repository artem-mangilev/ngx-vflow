import { center, drag, expect, pathPoint, test, viewport, type Locator, type Page, type Point } from './fixtures';

/** Demos follow the docs theme: cycle the ng-doc toggle (auto, light, dark) until the page has the theme. */
async function setDocsTheme(page: Page, theme: 'light' | 'dark') {
  const expected = theme === 'dark' ? 'dark' : null;
  for (let index = 0; index < 3; index += 1) {
    if ((await page.locator('html').getAttribute('data-theme')) === expected) return;
    await page.locator('ng-doc-theme-toggle button').click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

/** The path of an edge, by its id. */
function edgePath(demo: Locator, id: string) {
  return demo.locator(`[data-v-edge="${id}"] [data-v-interactive-edge]`);
}

/** A computed style property of an element. */
function style(locator: Locator, property: string) {
  return locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property), property);
}

/** Distance between two client points. */
function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** The middle of the outer side of a port: where an edge meets a port on the left or the right of a row. */
async function portRim(port: Locator, side: 'left' | 'right'): Promise<Point> {
  const box = (await port.boundingBox())!;
  return { x: side === 'left' ? box.x : box.x + box.width, y: box.y + box.height / 2 };
}

test.describe('workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/applications/workflow');
  });

  test('the nodes are the consumer markup, with one header each and the same height', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    await expect(demo.locator('[data-v-node]')).toHaveCount(4);
    await expect(demo.locator('[data-v-edge]')).toHaveCount(3);
    await expect(demo.locator('[data-label]')).toHaveCount(4);
    // Directives style the consumer article and header, without injecting wrapper elements.
    await expect(demo.locator('article > header')).toHaveCount(4);
    // Every card is as tall as the one with a button, so the straight edge between them has no step.
    const heights = await demo
      .locator('[data-v-node]')
      .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().height)));
    expect(new Set(heights).size).toBe(1);
  });

  test('a selected node shows its toolbar and keeps its status', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    const review = demo.locator('[data-v-node="review"]');

    await review.locator('header').click();

    await expect(review).toHaveAttribute('data-v-selected', '');
    await expect(review.getByTestId('status')).toHaveText('Waiting');
    await expect(demo.getByRole('button', { name: 'Zoom to Finance review', exact: true })).toBeVisible();
  });

  test('approving the review updates the statuses and draws the decision on the edges', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    const status = (id: string) => demo.locator(`[data-v-node="${id}"]`).getByTestId('status');
    const taken = demo.locator('[data-v-edge] path[data-state="taken"]');
    await expect(status('paid')).toHaveText('Pending');
    await expect(status('fix')).toHaveText('Missing PO');
    await expect(taken).toHaveCount(1);
    // The state is drawn, not only declared: a taken edge has another stroke than an open one.
    const open = demo.locator('[data-v-edge="review-paid"] path[data-state]');
    expect(await style(taken, 'stroke')).not.toBe(await style(open, 'stroke'));

    // A status is presentation only: the node keeps its action enabled.
    const approve = demo.getByRole('button', { name: 'Approve', exact: true });
    await approve.focus();
    await page.keyboard.press('Enter');

    await expect(status('review')).toHaveText('Approved');
    await expect(approve).toBeDisabled();
    await expect(status('paid')).toHaveText('Scheduled');
    await expect(status('fix')).toHaveText('Not needed');
    await expect(taken).toHaveCount(2);
    const skipped = demo.locator('[data-v-edge="review-fix"] path[data-state]');
    await expect(skipped).toHaveAttribute('data-state', 'skipped');
    await expect(skipped).toHaveCSS('stroke-dasharray', '4px, 4px');
    await expect(skipped).toHaveCSS('opacity', '0.45');
    await expect(demo.locator('[data-label="Rejected"]')).toHaveAttribute('data-state', 'skipped');
  });

  test('a selected edge takes the selection color over its process state', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    await demo.getByRole('button', { name: 'Approve', exact: true }).click();
    const edge = demo.locator('[data-v-edge="review-paid"]');
    const path = edge.locator('path[data-state="taken"]');
    const stroke = await style(path, 'stroke');

    // The approved branch is long enough to click between its labels, which sit at its start and its end.
    const middle = await pathPoint(edgePath(demo, 'review-paid'), 0.5);
    await page.mouse.click(middle.x, middle.y);

    await expect(edge).toHaveAttribute('data-v-selected', '');
    await expect.poll(() => style(path, 'stroke')).not.toBe(stroke);
  });

  test('the dark docs theme changes the colors of nodes and edges', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    await setDocsTheme(page, 'light');
    const card = demo.locator('[data-v-node="review"] article');
    const path = demo.locator('[data-v-edge="review-fix"] path[data-state]');
    const light = { card: await style(card, 'background-color'), edge: await style(path, 'stroke') };

    await setDocsTheme(page, 'dark');

    await expect.poll(() => style(card, 'background-color')).not.toBe(light.card);
    await expect.poll(() => style(path, 'stroke')).not.toBe(light.edge);
  });

  test('viewport controls zoom within the zoom limits of the flow', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    const flow = demo.locator('vflow');
    const controls = demo.getByRole('group', { name: 'Viewport controls' });
    const zoomIn = controls.getByRole('button', { name: 'Zoom in', exact: true });
    const zoomOut = controls.getByRole('button', { name: 'Zoom out', exact: true });
    const fitView = controls.getByRole('button', { name: 'Fit view', exact: true });
    const zoom = async () => (await viewport(flow)).zoom;

    // Each click waits until the button is enabled, so the last one may find it disabled by the zoom it reached.
    await expect(async () => {
      if (await zoomIn.isEnabled()) await zoomIn.click();
      await expect(zoomIn).toBeDisabled({ timeout: 500 });
    }).toPass();
    await expect.poll(zoom).toBeCloseTo(2, 5);
    await fitView.click();
    await expect(zoomIn).toBeEnabled();

    await expect(async () => {
      if (await zoomOut.isEnabled()) await zoomOut.click();
      await expect(zoomOut).toBeDisabled({ timeout: 500 });
    }).toPass();
    await expect.poll(zoom).toBeCloseTo(0.5, 5);
    await fitView.click();
    await expect(zoomOut).toBeEnabled();
  });

  test('edge labels at the start, center and end sit on their edge and move with a dragged node', async ({ page }) => {
    const demo = page.locator('app-ui-workflow-demo');
    const labels: [string, string][] = [
      ['€12,400', 'received-review'],
      ['Approved', 'review-paid'],
      ['within 1 day', 'review-paid'],
      ['Rejected', 'review-fix'],
    ];
    /** How far the center of each label is from the path of its edge. */
    const offEdge = () =>
      demo.evaluate((root, labels) => {
        return labels.map(([name, id]) => {
          const edge = root.querySelector<SVGPathElement>(`[data-v-edge="${id}"] [data-v-interactive-edge]`)!;
          const matrix = edge.getScreenCTM()!;
          const total = edge.getTotalLength();
          const rect = root.querySelector(`[data-label="${name}"]`)!.getBoundingClientRect();
          const middle = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          let best = Infinity;
          for (let length = 0; length <= total; length += 2) {
            const point = edge.getPointAtLength(length).matrixTransform(matrix);
            best = Math.min(best, Math.hypot(point.x - middle.x, point.y - middle.y));
          }
          return best;
        });
      }, labels);
    await expect.poll(async () => Math.max(...(await offEdge()))).toBeLessThan(2);
    const approved = demo.locator('[data-label="Approved"]');
    const before = (await approved.boundingBox())!;

    // Center the node: the docs header is sticky and would cover an element scrolled to the top edge.
    const paid = demo.locator('[data-v-node="paid"]');
    await paid.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const header = await center(paid.locator('header'));
    await drag(page, header, { x: header.x + 60, y: header.y + 90 });

    // The labels of the edge into the dragged node move with it and stay on its path.
    await expect.poll(async () => (await approved.boundingBox())!.y).not.toBeCloseTo(before.y, 0);
    await expect.poll(async () => Math.max(...(await offEdge()))).toBeLessThan(2);
  });
});

test('the theme scope changes the colors of every layer of the flow and leaves geometry alone', async ({ page }) => {
  await page.goto('/packages/ui/overview');
  const editor = page.getByTestId('editor');
  await editor.scrollIntoViewIfNeeded();
  const card = editor.locator('[data-v-node="source"] article');
  const path = editor.locator('[data-v-edge="source-target"] path[vuiEdge]');
  const root = editor.locator('[data-v-root]');
  const colors = async () => [
    await style(card, 'background-color'),
    await style(path, 'stroke'),
    await style(root, 'background-color'),
  ];
  const geometry = () =>
    editor.evaluate((element) =>
      Array.from(
        element.querySelectorAll<HTMLElement>('[data-v-node], [data-v-handle], [data-v-interactive-edge]'),
      ).map((part) => part.getAttribute('d') ?? `${part.style.transform}|${part.style.top}|${part.style.left}`),
    );
  const light = await colors();
  const before = await geometry();

  await page.getByLabel('Dark theme', { exact: true }).check();

  await expect(async () => {
    const dark = await colors();
    dark.forEach((color, index) => expect(color).not.toBe(light[index]));
  }).toPass();
  expect(await geometry()).toEqual(before);
});

test.describe('image lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/applications/pipeline');
    await page.locator('app-ui-pipeline-demo').evaluate((element) => element.scrollIntoView({ block: 'center' }));
  });

  const filterOf = (demo: Locator, stage: string) =>
    demo
      .locator(`[data-preview="${stage}"] > app-picture > [data-testid="filter"]`)
      .evaluate((element: HTMLElement) => element.style.filter);

  test('the number wired into Hue owns its amount', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const hue = demo.locator('[data-stage="hue"]');
    // The row names the source instead of offering a slider.
    await expect(hue.getByLabel('Hue amount', { exact: true })).toHaveCount(0);
    await expect(hue.getByTestId('linked')).toHaveText('from Number');
    await expect.poll(() => filterOf(demo, 'hue')).toBe('hue-rotate(90deg)');

    await demo.getByLabel('Number value', { exact: true }).fill('0.5');

    await expect.poll(() => filterOf(demo, 'hue')).toBe('hue-rotate(180deg)');
  });

  test('a native control inside a node changes its filter and does not drag the node', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const node = demo.locator('[data-v-node="blur"]');
    const start = await node.boundingBox();

    await node.getByLabel('Blur amount', { exact: true }).fill('0.8');

    await expect.poll(() => filterOf(demo, 'blur')).toBe('blur(7.8px)');
    expect(await node.boundingBox()).toEqual(start);
  });

  test('a new source picture reaches the output', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const output = demo.locator('[data-preview="output"]');
    // The output preview is the whole tree: the hue-rotated photo blended with the blurred texture.
    await expect(output.getByTestId('blend')).toHaveCount(1);
    await expect(output.locator('img')).toHaveCount(2);

    await demo.locator('[data-stage="photo"]').getByRole('combobox').selectOption('lake');

    const photo = await demo.locator('[data-preview="photo"] img').getAttribute('src');
    await expect(output.getByTestId('blend-a').locator('img')).toHaveAttribute('src', photo!);
  });

  test('a number does not connect to an image input', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const blendB = demo.locator('[data-stage="blend"] [data-port="b"] [data-v-handle]');
    await expect(demo.locator('[data-v-edge]')).toHaveCount(6);
    const from = await center(demo.locator('[data-stage="wave"] [data-v-handle][data-v-handle-position="right"]'));
    const to = await center(blendB);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 12 });
    await expect(blendB).toHaveAttribute('data-v-handle-state', 'invalid');
    await page.mouse.up();

    await expect(blendB).toHaveAttribute('data-v-handle-state', 'idle');
    await expect(demo.locator('[data-v-edge]')).toHaveCount(6);
  });

  test('an input takes one edge: wiring the photo into B replaces the texture branch', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const output = demo.locator('[data-preview="output"]');
    const photo = await demo.locator('[data-preview="photo"] img').getAttribute('src');

    await drag(
      page,
      demo.locator('[data-stage="photo"] [data-v-handle][data-v-handle-position="right"]'),
      demo.locator('[data-stage="blend"] [data-port="b"] [data-v-handle]'),
      15,
    );

    await expect(demo.locator('[data-v-edge="blur-blend-b"]')).toHaveCount(0);
    await expect(demo.locator('[data-v-edge]')).toHaveCount(6);
    await expect(
      demo.locator('[data-stage="blur"] [data-v-handle][data-v-handle-position="right"]'),
    ).not.toHaveAttribute('data-vui-connected');
    await expect(output.locator('img')).toHaveCount(2);
    await expect(output.getByTestId('blend-b').locator('img')).toHaveAttribute('src', photo!);
  });

  test('the palette adds a node that asks for an image until it is wired', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');

    await demo.getByLabel('Add a node', { exact: true }).selectOption('sepia');

    await expect(demo.locator('[data-v-node]')).toHaveCount(8);
    await expect(demo.getByRole('group', { name: 'Sepia' }).locator('[data-preview]')).toHaveText('Connect an image');
  });

  test('Download exports the picture as a png', async ({ page }) => {
    const demo = page.locator('app-ui-pipeline-demo');
    const download = page.waitForEvent('download');

    await demo.getByRole('button', { name: 'Download', exact: true }).click();

    expect((await download).suggestedFilename()).toBe('image-lab.png');
  });
});

test.describe('relationships map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/applications/relationships-map');
    await page.locator('app-ui-relationships-demo').evaluate((element) => element.scrollIntoView({ block: 'center' }));
  });

  const team = (demo: Locator, id: string) => demo.locator(`[data-team="${id}"]`);
  const members = (demo: Locator, id: string) => team(demo, id).getByTestId('members');
  const person = (demo: Locator, name: string) => demo.getByRole('group', { name, exact: true });

  /** How far a person sticks out of a team; at most zero means inside. */
  async function overflow(demo: Locator, name: string, id: string) {
    const box = (await team(demo, id).boundingBox())!;
    const rect = (await person(demo, name).getByTestId('person').boundingBox())!;
    return Math.max(
      box.x - rect.x,
      box.y - rect.y,
      rect.x + rect.width - box.x - box.width,
      rect.y + rect.height - box.y - box.height,
    );
  }

  /** Moves Dea from Growth into Infra, which fills Infra. */
  async function moveDeaToInfra(page: Page, demo: Locator) {
    await drag(page, person(demo, 'Dea Rossi').locator('header'), team(demo, 'infra'), 15);
    await expect(members(demo, 'infra')).toHaveText('3 people');
  }

  test('floating edges meet teams on their facing sides and mutual relations have no arrowhead', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');
    await expect(demo.locator('[data-team]')).toHaveCount(3);
    await expect(demo.getByTestId('avatar')).toHaveCount(5);
    await expect(demo.locator('[data-v-edge]')).toHaveCount(6);
    // A note has no handle at all.
    await expect(demo.getByTestId('note').locator('[data-v-handle]')).toHaveCount(0);
    await expect(demo.getByText('3 shared services', { exact: true })).toBeVisible();

    // The edge between the two teams leaves Platform on the side facing Growth and enters Growth on the facing side.
    await expect(async () => {
      const start = await pathPoint(edgePath(demo, 'platform-growth'), 0);
      const end = await pathPoint(edgePath(demo, 'platform-growth'), 1);
      const platform = (await team(demo, 'platform').boundingBox())!;
      const growth = (await team(demo, 'growth').boundingBox())!;
      expect(Math.abs(start.x - platform.x - platform.width)).toBeLessThan(8);
      expect(Math.abs(end.x - growth.x)).toBeLessThan(8);
    }).toPass();

    const arrows = {
      'platform-growth': 1,
      'platform-deploys': 0,
      'ana-ben': 1,
      'ben-eli': 0,
      'ana-chi': 1,
      'chi-dea': 1,
    };
    for (const [id, count] of Object.entries(arrows)) {
      await expect(demo.locator(`[data-v-edge="${id}"] path[marker-end^="url("]`), id).toHaveCount(count);
    }
  });

  test('a person dropped on a team moves into its nearest free spot', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');
    await expect(members(demo, 'platform')).toHaveText('3 people');
    await expect(members(demo, 'infra')).toHaveText('2 people');
    await expect(members(demo, 'growth')).toHaveText('2 people');

    await moveDeaToInfra(page, demo);

    await expect(members(demo, 'platform')).toHaveText('4 people');
    await expect(members(demo, 'growth')).toHaveText('1 person');
    await expect.poll(() => overflow(demo, 'Dea Rossi', 'infra')).toBeLessThanOrEqual(0.5);
    // Between Ben and Eli, over neither.
    const dea = (await person(demo, 'Dea Rossi').boundingBox())!;
    for (const name of ['Ben Osei', 'Eli Park']) {
      const other = (await person(demo, name).boundingBox())!;
      const overlaps =
        dea.x < other.x + other.width &&
        other.x < dea.x + dea.width &&
        dea.y < other.y + other.height &&
        other.y < dea.y + dea.height;
      expect(overlaps, name).toBe(false);
    }
  });

  test('a team without room shows it during the drag and refuses the drop', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');
    await moveDeaToInfra(page, demo);
    const chi = person(demo, 'Chi Nguyen');
    const before = (await chi.boundingBox())!;
    const from = await center(chi.locator('header'));
    const infra = await center(team(demo, 'infra'));

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(infra.x, infra.y, { steps: 15 });
    await expect(team(demo, 'infra')).toHaveAttribute('data-drop-target', 'full');
    await page.mouse.up();

    // The person returns where they were.
    await expect(members(demo, 'growth')).toHaveText('1 person');
    await expect(members(demo, 'infra')).toHaveText('3 people');
    await expect.poll(async () => (await chi.boundingBox())!.x).toBeCloseTo(before.x, 0);
  });

  test('dragging from the body of one card to another connects the two people', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');

    const reviews = demo.getByText('reviews', { exact: true });
    await expect(reviews).toHaveCount(2);

    await drag(page, person(demo, 'Chi Nguyen').getByTestId('body'), person(demo, 'Eli Park').getByTestId('body'), 15);

    await expect(demo.locator('[data-v-edge]')).toHaveCount(7);
    // The new relation is labeled like the other ones of its kind.
    await expect(reviews).toHaveCount(3);
  });

  test('two people connect once: a second connection between them is refused', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');

    await drag(page, person(demo, 'Chi Nguyen').getByTestId('body'), person(demo, 'Ana Lima').getByTestId('body'), 15);

    await expect(demo.locator('[data-v-edge]')).toHaveCount(6);
  });

  test('Delete removes a selected connection', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');
    const point = await pathPoint(edgePath(demo, 'ben-eli'), 0.25);

    await page.mouse.click(point.x, point.y);
    await expect(demo.locator('[data-v-edge="ben-eli"]')).toHaveAttribute('data-v-selected', '');
    await page.keyboard.press('Delete');

    await expect(demo.locator('[data-v-edge="ben-eli"]')).toHaveCount(0);
  });

  test('a selected team resizes and cannot shrink past its members', async ({ page }) => {
    const demo = page.locator('app-ui-relationships-demo');
    // Growth keeps one member, which leaves it room to shrink.
    await moveDeaToInfra(page, demo);
    await team(demo, 'growth').locator('header').click();
    const handle = demo.locator('[data-v-resize-control=handle][data-v-resize-control-position=bottom-right]');
    await expect(handle).toHaveCount(1);
    const before = (await team(demo, 'growth').boundingBox())!;

    await drag(page, handle, { x: before.x + 20, y: before.y + 20 }, 15);

    await expect.poll(async () => (await team(demo, 'growth').boundingBox())!.width).toBeLessThan(before.width - 20);
    expect(await overflow(demo, 'Chi Nguyen', 'growth')).toBeLessThanOrEqual(0.5);
  });
});

test('scroll and collapse: endpoints follow rows scrolled out of view, the header when collapsed, and the rows again', async ({
  page,
}) => {
  await page.goto('/examples/applications/erd-schema-mapping');
  const demo = page.locator('app-ui-scroll-collapse-demo');
  const flow = demo.locator('vflow');
  await demo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(demo.locator('[data-v-edge]')).toHaveCount(2);
  const rows = demo.locator('[data-rows="product"]');
  await expect(rows.locator('[vuiRow]')).toHaveCount(12);
  const port = (scope: string) =>
    demo.locator(`[data-entity="product"] ${scope} [data-v-handle][data-v-handle-position="right"]`);
  const rowPort = port('[data-field="brand-id"]');
  const hiddenRowPort = port('[data-field="supplier-id"]');
  /** How far the start of an edge is from the rim of a port. */
  const offPort = async (edge: string, handle: Locator) =>
    distance(await pathPoint(edgePath(demo, edge), 0), await portRim(handle, 'right'));
  /** How far the port of the hidden supplier row is from the bottom border of the scroll box. */
  const hiddenPortToBorder = async () => {
    const box = (await rows.boundingBox())!;
    return Math.abs((await center(hiddenRowPort)).y - box.y - box.height);
  };

  // The brand edge sits on its visible row; the supplier row is below the scroll box, and core keeps its port and its
  // edge on the bottom border of the box.
  await expect.poll(() => offPort('brand', rowPort)).toBeLessThan(1.5);
  await expect.poll(() => offPort('supplier', hiddenRowPort)).toBeLessThan(1.5);
  await expect.poll(hiddenPortToBorder).toBeLessThan(1.5);

  // Wheel over the rows scrolls them instead of zooming the graph.
  const before = await viewport(flow);
  const middle = await center(rows);
  await page.mouse.move(middle.x, middle.y);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => rows.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await viewport(flow)).toEqual(before);
  // The supplier row is still below: its edge stays on the border, and the visible brand row is measured again.
  await expect.poll(() => offPort('supplier', hiddenRowPort)).toBeLessThan(1.5);
  await expect.poll(hiddenPortToBorder).toBeLessThan(1.5);
  await expect.poll(() => offPort('brand', rowPort)).toBeLessThan(1.5);

  // Collapse: rows leave the DOM, proxy handles keep both edges attached to the header.
  await demo.getByRole('button', { name: 'Collapse Product', exact: true }).click();
  await expect(rows).toHaveCount(0);
  await expect(demo.locator('[data-v-edge]')).toHaveCount(2);
  // The header holds a proxy handle per row, all at the same place: the first one stands for every row.
  const headerPort = port('header').first();
  await expect.poll(() => offPort('brand', headerPort)).toBeLessThan(1.5);
  await expect.poll(() => offPort('supplier', headerPort)).toBeLessThan(1.5);

  // Expand: the same field IDs restore the endpoints on the rows.
  await demo.getByRole('button', { name: 'Expand Product', exact: true }).click();
  await expect(rows.locator('[vuiRow]')).toHaveCount(12);
  await expect.poll(() => offPort('brand', rowPort)).toBeLessThan(1.5);
  await expect.poll(() => offPort('supplier', hiddenRowPort)).toBeLessThan(1.5);
});

test.describe('ERD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/applications/erd-schema-mapping');
    await page.locator('app-ui-entities-demo').evaluate((element) => element.scrollIntoView({ block: 'center' }));
  });

  const port = (demo: Locator, entity: string, field: string, side: 'left' | 'right') =>
    demo.locator(`[data-entity="${entity}"] [data-field="${field}"] [data-v-handle][data-v-handle-position="${side}"]`);

  /** How far the ends of the email mapping, the edge other than the foreign key, are from the rims of its ports. */
  async function mappingOffPorts(demo: Locator) {
    const path = demo.locator('[data-v-edge]:not([data-v-edge="foreign-key"]) [data-v-interactive-edge]');
    return Math.max(
      distance(await pathPoint(path, 0), await portRim(port(demo, 'crm', 'email', 'right'), 'right')),
      distance(await pathPoint(path, 1), await portRim(port(demo, 'erp', 'email', 'left'), 'left')),
    );
  }

  test('free ports and row actions show on hover, and a selected table shows the actions of all its rows', async ({
    page,
  }) => {
    const demo = page.locator('app-ui-entities-demo');
    await expect(demo.locator('[data-frame]')).toHaveCount(2);
    await expect(demo.locator('[data-v-edge]')).toHaveCount(2);
    await expect(demo.locator('[data-v-handle][data-vui-connected]')).toHaveCount(4);
    const freePort = port(demo, 'customer', 'email', 'left');
    const deleteEmail = demo.getByRole('button', { name: 'Delete Customer.email', exact: true });
    await expect(freePort).toHaveCSS('opacity', '0');
    await expect(deleteEmail).toHaveCSS('opacity', '0');

    await demo.locator('[data-entity="customer"] [data-field="email"]').hover();
    await expect(freePort).toHaveCSS('opacity', '1');
    await expect(deleteEmail).toHaveCSS('opacity', '1');

    // A selected table shows the actions of all its rows, which is how touch reaches them.
    await demo.locator('[data-entity="order"] header').click();
    await expect(demo.getByRole('button', { name: 'Delete Order.total', exact: true })).toHaveCSS('opacity', '1');
    await expect(deleteEmail).toHaveCSS('opacity', '0');
  });

  test('a mapping removed from its label and drawn again ends on the ports of its rows', async ({ page }) => {
    const demo = page.locator('app-ui-entities-demo');
    await expect.poll(() => mappingOffPorts(demo)).toBeLessThan(1);

    // The remove button of a label shows on hover.
    await demo.getByText('Copy email', { exact: true }).hover();
    await demo.getByRole('button', { name: 'Remove Copy email connection', exact: true }).click();
    await expect(demo.locator('[data-v-edge]')).toHaveCount(1);
    await expect(demo.locator('[data-v-handle][data-vui-connected]')).toHaveCount(2);

    // Core overlays the target with its magnetic hit area during a connection: the pointer moves through it.
    const target = port(demo, 'erp', 'email', 'left');
    const from = await center(port(demo, 'crm', 'email', 'right'));
    const to = await center(target);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 12 });
    await expect(target).toHaveAttribute('data-v-handle-state', 'valid');
    await page.mouse.up();

    await expect(demo.locator('[data-v-edge]')).toHaveCount(2);
    // The label says what the new mapping does.
    await expect(demo.getByText('Copy email', { exact: true })).toBeVisible();
    await expect(demo.locator('[data-v-handle][data-vui-connected]')).toHaveCount(4);
    await expect.poll(() => mappingOffPorts(demo)).toBeLessThan(1);
  });

  test('Delete removes a selected connection', async ({ page }) => {
    const demo = page.locator('app-ui-entities-demo');
    const point = await pathPoint(edgePath(demo, 'foreign-key'), 0.25);

    await page.mouse.click(point.x, point.y);
    await expect(demo.locator('[data-v-edge="foreign-key"]')).toHaveAttribute('data-v-selected', '');
    await page.keyboard.press('Delete');

    await expect(demo.locator('[data-v-edge="foreign-key"]')).toHaveCount(0);
  });

  test('deleting a field removes its edges and leaves no detached endpoints', async ({ page }) => {
    const demo = page.locator('app-ui-entities-demo');
    await expect(demo.locator('[data-v-edge]')).toHaveCount(2);

    await demo.getByRole('button', { name: 'Delete CRM contact.email', exact: true }).click();

    await expect(demo.locator('[data-entity="crm"] [vuiRow]')).toHaveCount(1);
    await expect(demo.locator('[data-v-edge]')).toHaveCount(1);
    await expect(demo.locator('[data-v-handle][data-vui-connected]')).toHaveCount(2);
  });

  test('adding a field with a name and a type grows the table, which still drags freely', async ({ page }) => {
    const demo = page.locator('app-ui-entities-demo');
    const order = demo.locator('[data-entity="order"]');
    const name = order.getByLabel('Name of the new field of Order', { exact: true });
    const rows = order.locator('[vuiRow][data-field]');
    await expect(rows).toHaveCount(3);

    // The draft opens with the name focused; editing it is not selecting the table.
    await order.getByRole('button', { name: 'Add a field to Order', exact: true }).click();
    await expect(name).toBeFocused();
    await expect(demo.locator('[data-v-node="order"]')).not.toHaveAttribute('data-v-selected', '');
    await name.fill('status');
    await order.getByLabel('Type of the new field of Order', { exact: true }).selectOption('timestamp');
    await name.press('Enter');

    // Enter adds the field with the chosen type and its own ports.
    const row = order.locator('[data-field="status"]');
    await expect(row).toContainText('status');
    await expect(row).toContainText('timestamp');
    await expect(row.locator('[data-v-handle]')).toHaveCount(2);
    await expect(rows).toHaveCount(4);

    // The existing connection stays on its row; the frame wraps the taller table and the frames do not overlap.
    const keyPort = port(demo, 'order', 'customer-id', 'left');
    const frame = (id: string) => demo.locator(`[data-frame="${id}"]`);
    await expect
      .poll(async () => Math.abs((await pathPoint(edgePath(demo, 'foreign-key'), 1)).y - (await center(keyPort)).y))
      .toBeLessThan(1);
    await expect(async () => {
      const relationships = (await frame('relationships').boundingBox())!;
      const table = (await order.boundingBox())!;
      const mapping = (await frame('mapping').boundingBox())!;
      expect(relationships.y + relationships.height - table.y - table.height).toBeGreaterThan(8);
      expect(mapping.y - relationships.y - relationships.height).toBeGreaterThan(8);
    }).toPass();

    // The grown table still drags. It stays inside its frame, the default extent of a child, and the frame has room
    // on the left of the table, not on its right.
    const before = (await order.boundingBox())!;
    const grip = await center(order.locator('header'));
    await drag(page, grip, { x: grip.x - 120, y: grip.y });
    await expect.poll(async () => (await order.boundingBox())!.x).toBeLessThan(before.x - 80);
  });

  test('a taken field name is refused and the draft stays open', async ({ page }) => {
    const order = page.locator('app-ui-entities-demo [data-entity="order"]');
    const name = order.getByLabel('Name of the new field of Order', { exact: true });

    await order.getByRole('button', { name: 'Add a field to Order', exact: true }).click();
    await name.fill('total');
    await name.press('Enter');

    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(order.locator('[vuiRow][data-field]')).toHaveCount(3);
  });

  test('Escape drops the draft of a new field', async ({ page }) => {
    const order = page.locator('app-ui-entities-demo [data-entity="order"]');
    const name = order.getByLabel('Name of the new field of Order', { exact: true });
    await order.getByRole('button', { name: 'Add a field to Order', exact: true }).click();
    await name.fill('status');

    await name.press('Escape');

    await expect(name).toHaveCount(0);
    await expect(order.locator('[vuiRow][data-field]')).toHaveCount(3);
  });

  test('a table longer than seven fields scrolls, and hidden rows keep their edges on the borders', async ({
    page,
  }) => {
    const demo = page.locator('app-ui-entities-demo');
    const order = demo.locator('[data-entity="order"]');
    const box = demo.locator('[data-rows="order"]');
    const add = async (field: string) => {
      await order.getByRole('button', { name: 'Add a field to Order', exact: true }).click();
      await order.getByLabel('Name of the new field of Order', { exact: true }).fill(field);
      await order.getByLabel('Name of the new field of Order', { exact: true }).press('Enter');
    };
    // Up to seven fields the table does not scroll.
    for (const field of ['status', 'placed_at', 'shipped_at', 'note']) await add(field);
    await expect(order.locator('[vuiRow][data-field]')).toHaveCount(7);
    await expect(box).toHaveCount(0);

    // The eighth field makes it scroll, scrolled to the new last row.
    await add('currency');
    await expect(box).toHaveCount(1);
    await expect.poll(() => box.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await expect.poll(() => box.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(order.locator('[data-field="currency"]')).toBeInViewport();

    // Two more fields push the foreign key row out above: core keeps its port and the end of its edge on the top
    // border of the scroll box.
    for (const field of ['paid_at', 'refunded_at']) await add(field);
    await expect(order.locator('[data-field="refunded-at"]')).toBeInViewport();
    const keyPort = port(demo, 'order', 'customer-id', 'left');
    const end = () => pathPoint(edgePath(demo, 'foreign-key'), 1);
    const toPort = async () => distance(await end(), await portRim(keyPort, 'left'));
    const belowTop = async () => (await end()).y - (await box.boundingBox())!.y;
    await expect.poll(toPort).toBeLessThan(1.5);
    await expect.poll(async () => Math.abs(await belowTop())).toBeLessThan(1.5);

    // Scrolling back to the top puts the endpoint on its row again.
    const middle = await center(box);
    await page.mouse.move(middle.x, middle.y);
    await page.mouse.wheel(0, -1000);
    await expect.poll(belowTop).toBeGreaterThan(5);
    await expect.poll(toPort).toBeLessThan(1.5);
  });
});
