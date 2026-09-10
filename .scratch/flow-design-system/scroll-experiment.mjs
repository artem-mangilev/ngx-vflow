// Local naive-CSS experiment, not an assertion of library scroll support.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:4200/design-system/entities');
const demo = page.locator('app-ui-entities-demo');
await demo.locator('article').first().waitFor();
await demo.getByLabel('Scroll experiment', { exact: true }).check();
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const sample = async () => {
  await settle();
  return demo.evaluate((root) => {
    const path = root.querySelector('path.vui-edge');
    const row = root.querySelector('[data-entity="customer"] [data-field="id"]').getBoundingClientRect();
    const port = root
      .querySelector('[data-entity="customer"] [data-field="id"] .handle--right .vui-port')
      .getBoundingClientRect();
    const endpoint = path.getPointAtLength(0).matrixTransform(path.getScreenCTM());
    const list = root.querySelector('[data-entity="customer"] .fields');
    return {
      viewport: root.querySelector('.vflow-viewport').style.transform,
      scrollTop: list.scrollTop,
      endpointErrorY: +Math.abs(endpoint.y - port.y - port.height / 2).toFixed(3),
      endpointToRowErrorY: +Math.abs(endpoint.y - row.y - row.height / 2).toFixed(3),
      portToRowErrorY: +Math.abs(port.y + port.height / 2 - row.y - row.height / 2).toFixed(3),
      rowVisible: row.height > 0,
      path: path.getAttribute('d'),
      mountedFields: root.querySelectorAll('[data-field]').length,
      renderedEdges: root.querySelectorAll('path.vui-edge').length,
    };
  });
};
const results = [];
for (let zoom = 0; zoom < 2; zoom++) {
  await demo.locator('[data-entity="customer"] .fields').evaluate((el) => {
    el.scrollTop = 0;
  });
  const before = await sample();
  await demo.locator('[data-entity="customer"] .fields').hover();
  await page.mouse.wheel(0, 24);
  const after = await sample();
  results.push({ before, after });
  await demo.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await settle();
}
await demo.getByLabel('Scroll experiment', { exact: true }).uncheck();
const beforeCollapse = await sample();
await demo.getByLabel('Collapse experiment', { exact: true }).check();
const collapsed = await sample();
await demo.getByLabel('Collapse experiment', { exact: true }).uncheck();
const expanded = await sample();
const output = { browser: browser.version(), results, beforeCollapse, collapsed, expanded };
writeFileSync('.scratch/flow-design-system/scroll-results.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
await browser.close();
