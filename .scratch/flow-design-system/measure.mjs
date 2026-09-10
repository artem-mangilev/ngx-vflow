// Run with docs served on :4200. Diagnostic only; no CI timing assertion.
// node .scratch/flow-design-system/measure.mjs [route] [output.json]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import os from 'node:os';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const route = process.argv[2] ?? '/introduction/design-system';
const results = [];
for (let run = 0; run < 5; run++) {
  await page.goto('http://localhost:4200' + route);
  const demo = page.locator('app-ui-entities-demo');
  await demo.scrollIntoViewIfNeeded();
  await demo.locator('path.vui-edge').last().waitFor({ state: 'attached' });
  await demo.locator('article').last().waitFor();
  results.push(
    await demo.evaluate(async (root) => {
      const frame = () => new Promise(requestAnimationFrame);
      const measure = async (action) => {
        const start = performance.now();
        action();
        await frame();
        await frame();
        return +(performance.now() - start).toFixed(2);
      };
      const checkbox = (name) =>
        [...root.querySelectorAll('label')].find((l) => l.textContent.includes(name)).querySelector('input');
      const themeMs = await measure(() => checkbox('Dark theme').click());
      const densityMs = await measure(() => checkbox('Compact').click());
      const pane = root.querySelector('.vflow-pane');
      const rect = pane.getBoundingClientRect();
      const frames = [];
      let previous = await frame();
      for (let i = 0; i < 60; i++) {
        pane.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            deltaY: 2,
            clientX: rect.x + rect.width / 2,
            clientY: rect.y + rect.height / 2,
          }),
        );
        const next = await frame();
        frames.push(next - previous);
        previous = next;
      }
      frames.sort((a, b) => a - b);
      return {
        nodes: root.querySelectorAll('article').length,
        fields: root.querySelectorAll('[vflowField]').length,
        edges: root.querySelectorAll('path.vui-edge').length,
        dom: root.querySelectorAll('*').length,
        themeMs,
        densityMs,
        zoomFrameMedianMs: +frames[30].toFixed(2),
        zoomFrameP95Ms: +frames[57].toFixed(2),
      };
    }),
  );
}
const output = {
  route,
  platform: `${os.platform()} ${os.arch()} ${os.release()}`,
  cpu: os.cpus()[0].model,
  browser: browser.version(),
  viewport: '1280x900',
  results,
};
console.log(JSON.stringify(output, null, 2));
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(output, null, 2) + '\n');
await browser.close();
