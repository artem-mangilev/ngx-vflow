import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

const pages = [
  ['workflow', 'app-ui-workflow-demo', 'received'],
  ['pipeline', 'app-ui-pipeline-demo', 'photo'],
  ['erd-schema-mapping', 'app-ui-entities-demo', 'customer'],
  ['relationships-map', 'app-ui-relationships-demo', 'ana'],
] as const;

test.describe('accessibility', () => {
  // The flows fade in; axe samples the contrast of a fading element wrongly.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const [route, selector] of pages) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(`/examples/applications/${route}`);
      await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: 'center' }));

      const results = await new AxeBuilder({ page }).include(selector).analyze();
      expect(
        results.violations.map(
          (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
        ),
      ).toEqual([]);
    });
  }
});

for (const [route, selector, node] of pages) {
  test(`${route}: a focused node shows a focus ring`, async ({ page }) => {
    await page.goto(`/examples/applications/${route}`);
    const wrapper = page.locator(selector).locator(`[data-v-node="${node}"]`);
    await expect(wrapper).toHaveCSS('box-shadow', 'none');

    await wrapper.focus();

    await expect(wrapper).toBeFocused();
    await expect(wrapper).not.toHaveCSS('box-shadow', 'none');
  });
}
