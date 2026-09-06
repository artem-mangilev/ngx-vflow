const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  try {
    const pixelRatio = Number(process.argv.find((arg) => arg.startsWith('--dpr='))?.split('=')[1] ?? 1);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: pixelRatio });
    const minimap = process.argv.includes('--minimap');
    await page.goto(
      process.env.VFLOW_URL ||
        (minimap ? 'http://localhost:4200/viewport/minimap' : 'http://localhost:4200/performance/virtualization'),
    );
    if (minimap) {
      await page.waitForFunction(() => document.querySelectorAll('.vflow-node').length > 0);
      await page.evaluate(() => {
        const flow = window.ng.getComponent(document.querySelector('vflow'));
        flow.optimization = { virtualization: true };
        flow.nodes = Array.from({ length: 4900 }, (_, i) => ({ id: String(i), type: 'default' }));
        flow.flowEntitiesService
          .nodes()
          .forEach((node, i) => node.point.set({ x: Math.floor(i / 70) * 150, y: (i % 70) * 100 }));
        flow.edges = Array.from({ length: 4899 }, (_, i) => ({
          id: String(i),
          source: String(i),
          target: String(i + 1),
        }));
      });
    }
    await page.waitForFunction(() => document.querySelectorAll('.vflow-node').length === 4900);
    await page.waitForFunction(() => document.querySelector('.vflow-node')?.style.visibility === 'visible');
    const limit = process.argv.find((arg) => arg.startsWith('--nodes='));
    if (limit)
      await page.evaluate(
        (count) => {
          const flow = window.ng.getComponent(document.querySelector('vflow'));
          const nodes = flow.flowEntitiesService
            .nodes()
            .slice(0, count)
            .map((node) => node.rawNode);
          const ids = new Set(nodes.map((node) => node.id));
          flow.edges = flow.flowEntitiesService
            .edges()
            .map((edge) => edge.edge)
            .filter((edge) => ids.has(edge.source) && ids.has(edge.target));
          flow.nodes = nodes;
        },
        Number(limit.split('=')[1]),
      );
    if (process.argv.includes('--no-drag-status'))
      await page.evaluate(() => {
        window.ng.getComponent(document.querySelector('.vflow-node')).flowStatusService.setNodeDragStatus = () => {};
      });
    if (process.argv.includes('--hide-minimap'))
      await page.addStyleTag({ content: '.vflow-minimap {display:none!important}' });
    if (process.argv.includes('--all-hidden'))
      await page.addStyleTag({ content: '.vflow-nodes-layer,.vflow-edges-layer {display:none!important}' });
    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) await new Promise(requestAnimationFrame);
    });
    if (minimap) {
      const backing = await page.locator('.vflow-minimap canvas').evaluate((canvas) => ({
        width: canvas.width,
        height: canvas.height,
        expectedWidth: Math.round(parseFloat(canvas.style.width) * window.devicePixelRatio),
        expectedHeight: Math.round(parseFloat(canvas.style.height) * window.devicePixelRatio),
      }));
      assert.equal(backing.width, backing.expectedWidth, 'canvas must use device pixels');
      assert.equal(backing.height, backing.expectedHeight, 'canvas must use device pixels');
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.start');
    const result = await page.evaluate(
      async ({ zoom, wheelDelta, drag, selection, connection }) => {
        if (selection || connection) {
          const flow = window.ng.getComponent(document.querySelector('vflow'));
          const component = window.ng.getComponent(document.querySelector('.vflow-node'));
          const nodes = flow.flowEntitiesService.nodes();
          const source = nodes[71];
          const sourceHandle = source.handles().find((handle) => handle.rawHandle.type === 'source');
          if (connection) component.flowStatusService.setConnectionStartStatus(source, sourceHandle);
          const intervals = [];
          let previous = performance.now();
          for (let i = 0; i < 70; i++) {
            await new Promise(requestAnimationFrame);
            const now = performance.now();
            if (i > 4) intervals.push(now - previous);
            previous = now;
            const target = nodes[72 + (i % 2)];
            if (selection) {
              component.selectionService.select(target);
              component.nodeRenderingService.pullNode(target);
            } else {
              component.flowStatusService.setConnectionValidationStatus(
                true,
                source,
                target,
                sourceHandle,
                target.handles().find((handle) => handle.rawHandle.type === 'target'),
              );
            }
          }
          if (connection) component.flowStatusService.setIdleStatus();
          const sorted = intervals.toSorted((a, b) => a - b);
          return {
            mode: selection ? 'selection' : 'connection',
            nodes: nodes.length,
            medianMs: sorted[32],
            p95Ms: sorted[61],
            maxMs: sorted.at(-1),
            over33ms: intervals.filter((value) => value > 33.4).length,
          };
        }
        const pane = document.querySelector('.vflow-pane');
        const box = pane.getBoundingClientRect();
        const draggedNode = drag
          ? [...document.querySelectorAll('.vflow-node')].find((node) => {
              const rect = node.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.x > box.x + 100 &&
                rect.y > box.y + 80 &&
                rect.x < box.x + 400 &&
                rect.y < box.y + 300
              );
            })
          : null;
        if (drag && !draggedNode) throw new Error('No draggable node in test region');
        const dragRect = draggedNode?.getBoundingClientRect();
        const startX = dragRect ? dragRect.x + dragRect.width / 2 : box.x + 400;
        const startY = dragRect ? dragRect.y + dragRect.height / 2 : box.y + 100;
        const dragStart = draggedNode?.style.transform;
        const intervals = [];
        let midpoint = null;
        let previous = performance.now();
        const event = (type, x) =>
          new MouseEvent(type, { clientX: x, clientY: startY, buttons: 1, bubbles: true, view: window });
        if (!zoom) (draggedNode?.querySelector('default-node') ?? pane).dispatchEvent(event('mousedown', startX));
        for (let i = 0; i < 70; i++) {
          await new Promise(requestAnimationFrame);
          const now = performance.now();
          if (i > 4) intervals.push(now - previous);
          previous = now;
          if (i === 35)
            midpoint = {
              transform: document.querySelector('.vflow-viewport').style.transform,
              visibleNodes: [...document.querySelectorAll('.vflow-node')].filter(
                (node) => node.style.display !== 'none',
              ).length,
              visibleEdges: [...document.querySelectorAll('svg[edge]')].filter((edge) => edge.style.display !== 'none')
                .length,
            };
          if (zoom)
            pane.dispatchEvent(
              new WheelEvent('wheel', {
                deltaY: i < 35 ? wheelDelta : -wheelDelta,
                clientX: box.x + 400,
                clientY: box.y + 100,
                bubbles: true,
                cancelable: true,
              }),
            );
          else window.dispatchEvent(event('mousemove', startX + (drag ? 1 : -1) * i * 2));
        }
        if (!zoom) window.dispatchEvent(event('mouseup', startX + (drag ? 1 : -1) * 138));
        const nodes = [...document.querySelectorAll('.vflow-node')];
        const edges = [...document.querySelectorAll('svg[edge]')];
        const sorted = intervals.toSorted((a, b) => a - b);
        return {
          mode: drag ? 'drag' : zoom ? 'zoom' : 'pan',
          dragStart,
          dragEnd: draggedNode?.style.transform,
          midpoint,
          nodes: nodes.length,
          edges: edges.length,
          visibleNodes: nodes.filter((node) => getComputedStyle(node).display !== 'none').length,
          visibleEdges: edges.filter((edge) => getComputedStyle(edge).display !== 'none').length,
          domElements: document.querySelectorAll('*').length,
          medianMs: sorted[Math.floor(sorted.length / 2)],
          p95Ms: sorted[Math.floor(sorted.length * 0.95)],
          maxMs: sorted.at(-1),
          over33ms: intervals.filter((value) => value > 33.4).length,
          transform: document.querySelector('.vflow-viewport').style.transform,
        };
      },
      {
        selection: process.argv.includes('--selection'),
        connection: process.argv.includes('--connection'),
        drag: process.argv.includes('--drag'),
        zoom: process.argv.includes('--zoom'),
        wheelDelta: process.argv.includes('--wide-zoom') ? 100 : 8,
      },
    );
    const { profile } = await cdp.send('Profiler.stop');
    if (process.env.VFLOW_PROFILE) fs.writeFileSync(process.env.VFLOW_PROFILE, JSON.stringify(profile));
    const durations = new Map();
    profile.samples?.forEach((id, i) => durations.set(id, (durations.get(id) || 0) + (profile.timeDeltas[i] || 0)));
    result.topFunctions = profile.nodes
      .map((node) => ({
        function: node.callFrame.functionName,
        file: node.callFrame.url.split('/').at(-1),
        line: node.callFrame.lineNumber + 1,
        selfMs: (durations.get(node.id) || 0) / 1000,
      }))
      .sort((a, b) => b.selfMs - a.selfMs)
      .slice(0, 15);
    console.log(JSON.stringify(result, null, 2));
    if (process.argv.includes('--drag')) assert.notEqual(result.dragStart, result.dragEnd, 'node must actually move');
    if (process.argv.includes('--assert'))
      assert.ok(result.p95Ms < 33.4, `p95 frame ${result.p95Ms.toFixed(1)}ms exceeds 33.4ms budget`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
