const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      '<div id="node"><div id="content" style="width:240px;height:80px"><input value="draft"></div></div>',
    );
    await page.evaluate(() => {
      window.observations = [];
      window.originalInput = document.querySelector('input');
      new ResizeObserver(([entry]) => window.observations.push(entry.contentRect.width)).observe(
        document.querySelector('#content'),
      );
    });
    await page.waitForFunction(() => window.observations.at(-1) === 240);
    const snapshot = () =>
      page.evaluate(() => ({
        width: document.querySelector('#content').scrollWidth,
        height: document.querySelector('#content').scrollHeight,
        sameInput: document.querySelector('input') === window.originalInput,
        value: document.querySelector('input').value,
        focused: document.activeElement === window.originalInput,
        observerWidths: [...window.observations],
      }));

    await page.evaluate(() => (document.querySelector('#node').style.visibility = 'hidden'));
    const measuring = await snapshot();
    assert.equal(measuring.width, 240);
    assert.equal(measuring.height, 80);

    await page.evaluate(() => {
      document.querySelector('#node').style.visibility = '';
      document.querySelector('input').focus();
    });
    assert.equal((await snapshot()).focused, true);
    await page.evaluate(() => (document.querySelector('#node').style.display = 'none'));
    await page.waitForFunction(() => window.observations.at(-1) === 0);
    const hidden = await snapshot();
    assert.equal(hidden.width, 0);
    assert.equal(hidden.height, 0);
    assert.equal(hidden.focused, false);
    assert.equal(hidden.sameInput, true);
    assert.equal(hidden.value, 'draft');

    await page.evaluate(() => (document.querySelector('#node').style.display = ''));
    await page.waitForFunction(() => window.observations.at(-1) === 240);
    const restored = await snapshot();
    assert.equal(restored.width, 240);
    assert.equal(restored.sameInput, true);
    assert.equal(restored.value, 'draft');
    console.log(JSON.stringify({ browser: browser.version(), measuring, hidden, restored }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
