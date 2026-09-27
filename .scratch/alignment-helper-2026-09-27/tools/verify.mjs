// Drives the alignment helper demo with real (CDP) mouse and keyboard input and prints where nodes land.
// Usage: node verify.mjs [baseUrl] [screenshotDir]
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4200';
const shots = process.argv[3];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = {};

async function open() {
  await page.goto(base + '/viewport/alignment-helper');
  await page.waitForSelector('vflow [node]');
  await page.waitForFunction(() => document.querySelector('vflow').getBoundingClientRect().left < 600);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const cmp = window.ng.getComponent(document.querySelector('vflow'));
    const viewport = () => cmp.viewportService.readableViewport();
    const pane = () => document.querySelector('.vflow-pane').getBoundingClientRect();
    const model = (id) => cmp.flowEntitiesService.nodes().find((n) => n.rawNode.id === id);
    window.__h = {
      zoom: () => viewport().zoom,
      client: (x, y) => ({
        x: pane().x + viewport().x + x * viewport().zoom,
        y: pane().y + viewport().y + y * viewport().zoom,
      }),
      pos: (id) => {
        const { x, y } = model(id).globalPoint();
        return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
      },
      selected: () => cmp.flowEntitiesService.nodes().filter((n) => n.selected()).map((n) => n.rawNode.id),
      guides: () => ({
        lines: [...document.querySelectorAll('line.vflow-alignment-line')].map(
          (l) =>
            ['x1', 'y1', 'x2', 'y2'].map((a) => Math.round(+l.getAttribute(a) * 100) / 100).join(',') +
            (l.getAttribute('stroke-dasharray') ? ' center' : ''),
        ),
        marks: !!document.querySelector('path.vflow-alignment-line'),
        vectorEffect: document.querySelector('.vflow-alignment-line')
          ? getComputedStyle(document.querySelector('.vflow-alignment-line')).vectorEffect
          : null,
      }),
    };
  });
}

const h = (fn, ...args) => page.evaluate(([fn, args]) => window.__h[fn](...args), [fn, args]);

/** Presses at a flow point, moves by a flow distance and reports positions and guides before the release. */
async function drag(from, by, { release = true, before, during } = {}) {
  const start = await h('client', from.x, from.y);
  const zoom = await h('zoom');
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  if (before) await before();
  await page.mouse.move(start.x + by.x * zoom, start.y + by.y * zoom, { steps: 8 });
  await page.waitForTimeout(50);
  const snapshot = { guides: await h('guides') };
  if (during) snapshot.during = await during();
  if (release) await page.mouse.up();
  await page.waitForTimeout(50);
  return snapshot;
}

async function shot(name) {
  if (shots) await page.locator('vflow').screenshot({ path: `${shots}/${name}.png` });
}

// Equal gaps: 7 goes between 5 (10..110) and 6 (300..400) at y 300
await open();
{
  const r = await drag({ x: 500, y: 250 }, { x: -292, y: 83 }, { release: false });
  await shot('gap-center');
  await page.mouse.up();
  results.gapCenter = { node7: await h('pos', '7'), expected: { x: 155, y: 300 }, guides: r.guides };
}

// Continue the row: 4 lands after 6 with the gap 7 now leaves on each side
{
  const r = await drag({ x: 500, y: 100 }, { x: 0, y: 212 }, { release: false });
  await shot('gap-repeat');
  await page.mouse.up();
  results.gapRepeat = { node4: await h('pos', '4'), expected: { x: 445, y: 300 }, guides: r.guides };
}

// Straight edge: 4 moves down next to the level of 2's source handle
await open();
{
  const r = await drag({ x: 500, y: 100 }, { x: 0, y: 20 }, { release: false });
  await shot('straight-edge');
  await page.mouse.up();
  results.straightEdge = { node4: await h('pos', '4'), guides: r.guides };
}

// A child near its parent's border does not snap to it, and snaps to the parent's center; its center row 145 is
// 10 from the parent's 135, so it also moves up to it
await open();
{
  const border = await drag({ x: 240, y: 145 }, { x: -37, y: 0 });
  results.childBorder = { node2: await h('pos', '2'), expected: { x: 153, y: 110 }, guides: border.guides };
  const center = await drag({ x: 205, y: 145 }, { x: 74, y: 0 });
  results.childCenter = { node2: await h('pos', '2'), expected: { x: 225, y: 110 }, guides: center.guides };
}

// A selection moves as one: 1 and 5 selected, 1 dragged next to the top of 2
await open();
{
  const one = await h('client', 60, 35);
  const five = await h('client', 60, 325);
  await page.mouse.click(one.x, one.y);
  await page.keyboard.down('Meta');
  await page.mouse.click(five.x, five.y);
  await page.keyboard.up('Meta');
  const before = { one: await h('pos', '1'), five: await h('pos', '5'), selected: await h('selected') };
  await drag({ x: 60, y: 35 }, { x: 0, y: 113 });
  const after = { one: await h('pos', '1'), five: await h('pos', '5') };
  results.selection = { before, after, keepsDistance: after.five.y - after.one.y === before.five.y - before.one.y };
}

// Alt moves freely, releasing it snaps again on the next move
await open();
{
  const start = await h('client', 500, 250);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.keyboard.down('Alt');
  await page.mouse.move(start.x - 292, start.y + 83, { steps: 8 });
  await page.waitForTimeout(50);
  const bypassed = { node7: await h('pos', '7'), guides: await h('guides') };
  await page.keyboard.up('Alt');
  await page.mouse.move(start.x - 292, start.y + 84, { steps: 1 });
  await page.waitForTimeout(50);
  const snapped = { node7: await h('pos', '7') };
  await page.mouse.up();
  results.bypass = { bypassed, snapped, expectedBypassed: { x: 158, y: 303 } };
}

// The drag end event and the last position change carry the snapped position
await open();
{
  await page.evaluate(() => {
    const el = document.querySelector('vflow');
    const dirs = window.ng.getDirectives(el);
    const drag = dirs.find((d) => d.constructor.name.includes('NodeDragController'));
    const changes = dirs.find((d) => d.constructor.name.includes('ChangesController'));
    window.__log = [];
    drag.nodeDragEnd.subscribe((e) => window.__log.push(['end', e.node.id, e.node.point()]));
    changes.nodesChangesPosition.subscribe((c) => window.__log.push(['position', ...c.map((x) => [x.id, x.point])]));
  });
  await drag({ x: 500, y: 250 }, { x: -292, y: 83 });
  const log = await page.evaluate(() => window.__log);
  results.events = { last: log.slice(-2), node7: await h('pos', '7') };
}

// The tolerance is in screen pixels: at zoom 2, 4 flow units (8 px) snaps and 6 (12 px) does not
await open();
{
  await page.evaluate(() => {
    const cmp = window.ng.getComponent(document.querySelector('vflow'));
    cmp.viewportService.writableViewport.set({ changeType: 'absolute', state: { zoom: 2, x: -600, y: -400 }, duration: 0 });
  });
  await page.waitForTimeout(500);
  const zoom = await h('zoom');
  // 7 (450, 220) moves 4 below the top of 6 (300..400, y 300), the only other node in view on its row
  const near = await drag({ x: 500, y: 250 }, { x: 0, y: 84 }, { release: false });
  await shot('zoom-2');
  await page.mouse.up();
  const nearPos = await h('pos', '7');
  await drag({ x: 500, y: 330 }, { x: 0, y: 6 });
  const farPos = await h('pos', '7');
  results.zoomTolerance = { zoom, near: nearPos, expectedNear: 300, far: farPos, expectedFar: 306, guides: near.guides };
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
