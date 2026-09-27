// Per-frame DOM state during the demo load: nodes, nodes in layout, hidden-but-in-layout, edges in layout.
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4300';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
if (process.env.STABLE) await page.addStyleTag({ content: '.ng-doc-pane-content { width: 744px !important; }' });
const log = await page.evaluate(async () => {
  const out = [];
  const t0 = performance.now();
  let last = '';
  let frames = 0;
  await new Promise((resolve) => {
    const tick = () => {
      const ns = document.querySelectorAll('.vflow-node');
      let shown = 0,
        hidden = 0;
      for (const n of ns) {
        if (n.style.display !== 'none') {
          shown++;
          if (n.style.visibility === 'hidden') hidden++;
        }
      }
      const es = document.querySelectorAll('svg[edge]');
      let eShown = 0;
      for (const e of es) if (e.style.display !== 'none' && e.style.visibility !== 'hidden') eShown++;
      const root = document.querySelector('.vflow-root');
      const r = root ? root.getBoundingClientRect() : null;
      const vp = document.querySelector('.vflow-viewport');
      const s = `root=${r ? Math.round(r.width) + 'x' + Math.round(r.height) : '-'} vp=${vp ? vp.style.transform : '-'} nodes=${ns.length} inLayout=${shown} hiddenInLayout=${hidden} edgesShown=${eShown}`;
      if (s !== last) {
        out.push(`${(performance.now() - t0).toFixed(0).padStart(6)}ms f${frames} ${s}`);
        last = s;
      }
      frames++;
      if (performance.now() - t0 < 4000) requestAnimationFrame(tick);
      else resolve();
    };
    history.pushState(null, '', '/performance/virtualization');
    dispatchEvent(new PopStateEvent('popstate'));
    requestAnimationFrame(tick);
  });
  return out;
});
console.log(log.join('\n'));
await browser.close();
