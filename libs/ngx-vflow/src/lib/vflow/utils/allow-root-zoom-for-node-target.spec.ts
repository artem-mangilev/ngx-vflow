import { allowRootZoomForNodeTarget } from './allow-root-zoom-for-node-target';

// Which elements pan the pane is covered by press-target.spec.ts; this covers what the wrapper adds.
describe('allowRootZoomForNodeTarget', () => {
  function pointerdownOn(target: Element) {
    const event = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: target });
    return event;
  }

  function child(parentAttribute?: string) {
    const parent = document.createElement('div');
    if (parentAttribute) parent.setAttribute(parentAttribute, '');
    const body = document.createElement('div');
    parent.append(body);
    return body;
  }

  it('allows every event other than a pointer press', () => {
    expect(allowRootZoomForNodeTarget(new WheelEvent('wheel'), true)).toBe(true);
    expect(allowRootZoomForNodeTarget(new Event('touchstart'), true)).toBe(true);
  });

  it('rejects any press while the selection modifier is held', () => {
    expect(allowRootZoomForNodeTarget(pointerdownOn(child()), true)).toBe(false);
  });

  it('allows a press that no control or handle keeps, and rejects one inside a no-pan part', () => {
    expect(allowRootZoomForNodeTarget(pointerdownOn(child()), false)).toBe(true);
    expect(allowRootZoomForNodeTarget(pointerdownOn(child('data-v-no-pan')), false)).toBe(false);
    expect(allowRootZoomForNodeTarget(pointerdownOn(child('data-v-handle-type')), false)).toBe(false);
  });
});
