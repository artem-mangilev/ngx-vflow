import { expect, test as base, type CDPSession, type Locator, type Page } from '@playwright/test';

export { expect };
export type { Locator, Page };

export interface Point {
  x: number;
  y: number;
}

interface Options {
  /** Console errors and page errors a test expects; any other one fails the test. */
  allowedErrors: RegExp[];
}

export const test = base.extend<Options>({
  allowedErrors: [[], { option: true }],
  page: async ({ page, allowedErrors }, use) => {
    const errors: string[] = [];
    const record = (text: string) => !allowedErrors.some((pattern) => pattern.test(text)) && errors.push(text);
    page.on('pageerror', (error) => record(error.message));
    page.on('console', (message) => message.type() === 'error' && record(message.text()));

    // A prerendered page is replaced by the application in the browser: a locator resolved against the server copy
    // goes stale. Every flow has had its first layout once none is initializing.
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await expect(page.locator('vflow').first()).toBeAttached();
      await expect(page.locator('vflow.v-initializing')).toHaveCount(0);
      return response;
    };

    await use(page);
    expect(errors, 'page errors and console errors').toEqual([]);
  },
});

/** Center of an element in client space. */
export async function center(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Expected a rendered element');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Presses at one point or element, moves to another in steps and releases, with the mouse. */
export async function drag(page: Page, from: Point | Locator, to: Point | Locator, steps = 10) {
  const start = 'boundingBox' in from ? await center(from) : from;
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const end = 'boundingBox' in to ? await center(to) : to;
  await page.mouse.move(end.x, end.y, { steps });
  await page.mouse.up();
}

/** The viewport of a flow: its pan in pixels of the pane and its zoom. */
export function viewport(flow: Locator) {
  return flow.locator('[data-v-portal-layer="below"]').evaluate((layer) => {
    const matrix = new DOMMatrix(getComputedStyle(layer.parentElement!).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

/** The box of the pane of a flow, the surface its viewport gestures start on. */
export async function paneBox(flow: Locator) {
  const box = await flow.locator('[data-v-root]').boundingBox();
  if (!box) throw new Error('Expected a rendered flow');
  return box;
}

/** Flow-space position of a node, from the transform the flow sets, so pan and zoom do not matter. */
export function flowPoint(node: Locator): Promise<Point> {
  return node.evaluate((element: HTMLElement) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f };
  });
}

/** Client point at a fraction of the length of an SVG path: 0 is its start, 1 its end. */
export function pathPoint(path: Locator, fraction: number): Promise<Point> {
  return path.evaluate((element: SVGPathElement, fraction) => {
    const point = element
      .getPointAtLength(element.getTotalLength() * fraction)
      .matrixTransform(element.getScreenCTM()!);
    return { x: point.x, y: point.y };
  }, fraction);
}

/** Dispatches real touch events through the DevTools protocol; each point is a finger, identified by its index. */
export async function touchscreen(page: Page) {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  return (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', points: Point[] = []) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map((point, id) => ({ ...point, id })) });
}
