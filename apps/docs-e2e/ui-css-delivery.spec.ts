import { expect, test } from '@playwright/test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Build @vflow/ui first. The browser consumes CSS directly, with no Tailwind runtime/plugin.
test('published compiled and source CSS have identical browser output', async ({ page }) => {
  const root = join(__dirname, '../..');
  const packageRoot = join(root, 'dist/libs/ui');
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  for (const path of ['./styles.css', './styles.source.css', './bpmn']) expect(manifest.exports[path]).toBeTruthy();
  expect(manifest.sideEffects).toEqual(expect.arrayContaining(['./styles.css', './styles.source.css']));
  const source = readFileSync(join(packageRoot, 'styles.source.css'), 'utf8');
  expect(source).not.toMatch(/@(?:import|source|tailwind|theme)\b/);
  const temporary = mkdtempSync(join(tmpdir(), 'vui-css-'));
  try {
    execFileSync(join(root, 'node_modules/.bin/tailwindcss'), [
      '-i',
      join(packageRoot, 'styles.source.css'),
      '-o',
      join(temporary, 'source.css'),
      '--minify',
    ]);
    const styles = [
      readFileSync(join(packageRoot, 'styles.css'), 'utf8'),
      readFileSync(join(temporary, 'source.css'), 'utf8'),
    ];
    const outputs: unknown[] = [];
    for (const css of styles) {
      await page.setContent(`<style>${css}</style>
        <style>.override { --vui-space: 20px; --vui-font-size: 17px; --vui-accent: #007766; --vui-field-min-height: 55px; --vui-edge-width: 4px; --vui-status-warning-color: #854d0e; }</style>
        <div id="unscoped"></div>
        ${['light', 'dark']
          .map(
            (theme) => `<section data-vui-theme="${theme}" class="override">
          <article class="vui-node" data-vui-selected="true"><header class="vui-node-header">Title</header><div class="vui-field">Field <span class="vui-port"></span></div></article>
          <span class="vui-status" data-tone="warning">Warning</span><button class="vui-button">Action</button>
          <div class="vui-bpmn-event" data-event="end"></div><svg><path class="vui-edge" d="M0 0L30 30" /></svg>
        </section>`,
          )
          .join('')}`);
      outputs.push(
        await page.locator('section *').evaluateAll((elements) =>
          elements.map((el) => {
            const style = getComputedStyle(el);
            return [
              style.color,
              style.backgroundColor,
              style.stroke,
              style.strokeWidth,
              style.fontSize,
              style.fontFamily,
              style.lineHeight,
              style.borderRadius,
              style.outlineColor,
              style.padding,
              style.minHeight,
            ];
          }),
        ),
      );
      expect(
        await page.locator('#unscoped').evaluate((el) => getComputedStyle(el).getPropertyValue('--vflow-background')),
      ).toBe('');
      await expect(page.locator('.vui-field').first()).toHaveCSS('min-height', '55px');
      await expect(page.locator('.vui-edge').first()).toHaveCSS('stroke-width', '4px');
      await expect(page.locator('.vui-status').last()).toHaveCSS('color', 'rgb(133, 77, 14)');
      await expect(page.locator('.vui-button').first()).toHaveCSS('background-color', 'rgb(0, 119, 102)');
    }
    expect(outputs[0]).toEqual(outputs[1]);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
