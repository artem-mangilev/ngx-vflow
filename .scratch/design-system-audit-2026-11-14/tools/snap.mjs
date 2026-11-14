import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/Users/artemmangilev/Documents/dev/ngx-vflow/');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const pages = [
  'design-system/overview', 'design-system/tokens', 'design-system/workflow', 'design-system/pipeline',
  'design-system/erd-schema-mapping', 'design-system/relationships-map',
  'edges/labels', 'edges/custom-edges', 'edges/markers', 'interactions/accessibility',
];
const collect = () => {
  const props = ['boxSizing','display','position','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderTopColor','borderBottomWidth','borderBottomColor','backgroundColor','color','borderTopLeftRadius','opacity','boxShadow','stroke','strokeDasharray','fontSize','fontWeight','columnGap','minWidth','minHeight','marginLeft','alignItems','flexGrow','flexShrink','outlineStyle','outlineColor','outlineWidth','cursor','transitionProperty'];
  const els = [...document.querySelectorAll('[data-v-node] *, [data-v-edge] path, .vui-edge-label, .vui-edge-label *, .vui-toolbar, .vui-toolbar *, vui-controls, vui-controls *, [data-testid^="tokens-"] *')];
  return els.filter((e) => !e.closest('app-picture')).map((e) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    const before = getComputedStyle(e, '::before');
    return [e.tagName.toLowerCase(), [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 10) / 10).join(','), props.map((p) => cs[p]).join('|'), before.content + '|' + before.position + '|' + before.top + '|' + before.left + '|' + before.right + '|' + before.bottom].join(' :: ');
  });
};
const browser = await chromium.launch();
const result = {};
for (const path of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:4200/' + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  const demos = page.locator('.demo, vflow').first();
  await demos.waitFor({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  let prev = '';
  for (let i = 0; i < 12; i++) { const cur = JSON.stringify(await page.evaluate(collect)); if (cur === prev) break; prev = cur; await page.waitForTimeout(500); }
  result[path] = { rest: await page.evaluate(collect) };
  // states: hover and select the first node, select the first edge
  const node = page.locator('[data-v-node]').first();
  if (await node.count()) {
    await node.scrollIntoViewIfNeeded();
    await node.hover({ position: { x: 20, y: 12 } }).catch(() => {});
    await page.waitForTimeout(200);
    result[path].hover = await page.evaluate(collect);
    await node.click({ position: { x: 20, y: 12 } }).catch(() => {});
    await page.waitForTimeout(300);
    result[path].nodeSelected = await page.evaluate(collect);
  }
  const edge = page.locator('[data-v-edge] path.vui-edge').first();
  if (await edge.count()) {
    const pt = await edge.evaluate((e) => { const p = e.getPointAtLength(e.getTotalLength() / 4).matrixTransform(e.getScreenCTM()); return { x: p.x, y: p.y }; });
    await page.mouse.click(pt.x, pt.y);
    await page.waitForTimeout(300);
    result[path].edgeSelected = await page.evaluate(collect);
  }
  await page.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(result));
console.log(Object.entries(result).map(([k, v]) => k + ': ' + Object.entries(v).map(([s, a]) => s + '=' + a.length).join(' ')).join('\n'));
