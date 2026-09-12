import AxeBuilder from '@axe-core/playwright';
import { expect, Locator, test } from '@playwright/test';

const pages = [
  ['workflow', 'app-ui-workflow-demo'],
  ['pipeline', 'app-ui-pipeline-demo'],
  ['erd-schema-mapping', 'app-ui-entities-demo'],
  ['relationships-map', 'app-ui-relationships-demo'],
  ['bpmn', 'app-ui-bpmn-demo'],
] as const;

for (const [route, selector] of pages) {
  test(`accessibility: ${route} has no axe violations, focusable entities and visible focus`, async ({ page }) => {
    await page.goto(`/design-system/${route}`);
    const demo = page.locator(selector);
    await demo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await expect(demo.locator('.vflow-node').first()).toBeVisible();
    // Let the fit-view animation finish: axe samples backgrounds of moving elements unreliably.
    const viewportTransform = () =>
      demo
        .locator('.vflow-viewport')
        .first()
        .evaluate((element) => element.style.transform);
    await expect
      .poll(async () => {
        const first = await viewportTransform();
        await page.waitForTimeout(150);
        return first === (await viewportTransform());
      })
      .toBe(true);
    const results = await new AxeBuilder({ page }).include(selector).analyze();
    expect(
      results.violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
      ),
    ).toEqual([]);
    // Core keeps focus on its wrappers; the theme maps --vflow-focus, so the outline is the accent color.
    const wrapper = demo.locator('.vflow-node').first();
    await wrapper.focus();
    await expect(wrapper).toBeFocused();
    await expect(wrapper).toHaveCSS('outline-color', /rgb\(67, 56, 202\)|rgb\(181, 172, 255\)/);
  });
}

test('states: busy indicator stops animating under reduced motion and keeps its text', async ({ page }) => {
  await page.goto('/design-system/workflow');
  const busy = page.locator('app-ui-workflow-demo .vui-status[data-busy="true"]').first();
  await expect(busy).toHaveText('Scheduling');
  const animation = () => busy.evaluate((element) => getComputedStyle(element, '::before').animationName);
  await expect.poll(animation).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(animation).toBe('none');
  await expect(busy).toHaveText('Scheduling');
});

async function rowEndpointError(demo: Locator) {
  return demo.evaluate((root) => {
    const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[1];
    const source = root
      .querySelector('[data-entity="crm"] [data-field="email"] .handle--right .vui-port')!
      .getBoundingClientRect();
    const target = root
      .querySelector('[data-entity="erp"] [data-field="email"] .handle--left .vui-port')!
      .getBoundingClientRect();
    const matrix = edge.getScreenCTM()!;
    const start = edge.getPointAtLength(0).matrixTransform(matrix);
    const end = edge.getPointAtLength(edge.getTotalLength()).matrixTransform(matrix);
    return Math.max(
      Math.abs(start.x - source.right),
      Math.abs(start.y - source.y - source.height / 2),
      Math.abs(end.x - target.left),
      Math.abs(end.y - target.y - target.height / 2),
    );
  });
}

test('geometry: long names, typography and density changes keep endpoints on their rows', async ({ page }) => {
  await page.goto('/design-system/erd-schema-mapping');
  const demo = page.locator('app-ui-entities-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect.poll(() => rowEndpointError(demo)).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Long names', exact: true }).click();
  const name = demo.locator('[data-entity="erp"] [data-field="email"] .vui-title');
  await expect(name).toContainText('primary_business_contact');
  const height = () => name.evaluate((element) => element.getBoundingClientRect().height);
  await expect.poll(height).toBeGreaterThan(20);
  await expect.poll(() => rowEndpointError(demo)).toBeLessThan(1);
  await demo.locator('section.demo').evaluate((element: HTMLElement) => {
    element.style.setProperty('--vui-font-size', '18px');
    element.style.setProperty('--vui-space', '6px');
  });
  await expect(demo.locator('article.vui-node').first()).toHaveCSS('font-size', '18px');
  await expect.poll(() => rowEndpointError(demo)).toBeLessThan(1);
  await demo.getByRole('button', { name: 'Long names', exact: true }).click();
  await expect.poll(() => rowEndpointError(demo)).toBeLessThan(1);
});

test('geometry: endpoints stay on ports after zooming through the controls', async ({ page }) => {
  await page.goto('/design-system/workflow');
  const workflow = page.locator('app-ui-workflow-demo');
  const controls = workflow.getByRole('group', { name: 'Viewport controls' });
  const endpointError = () =>
    workflow.evaluate((root) => {
      const edge = root.querySelectorAll<SVGPathElement>('path.vui-edge')[0];
      const port = root.querySelector('.vflow-node .handle--right .vui-port')!.getBoundingClientRect();
      const start = edge.getPointAtLength(0).matrixTransform(edge.getScreenCTM()!);
      return Math.max(Math.abs(start.x - port.right), Math.abs(start.y - port.y - port.height / 2));
    });
  await expect.poll(endpointError).toBeLessThan(1);
  const zoom = () =>
    workflow.locator('.vflow-viewport').evaluate((element) => {
      const match = /scale\(([^)]+)\)/.exec(element.style.transform);
      return match ? Number(match[1]) : 1;
    });
  const initial = await zoom();
  await controls.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await controls.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(zoom).toBeCloseTo(initial * 1.44, 3);
  await expect.poll(endpointError).toBeLessThan(1.5);
});
