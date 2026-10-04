import { allowRootZoomForNodeTarget } from './allow-root-zoom-for-node-target';

// Which node elements pan the pane is covered by press-target.spec.ts; this covers what the wrapper adds.
describe('allowRootZoomForNodeTarget', () => {
  function pointerdownOn(target: Element) {
    const event = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: target });
    return event;
  }

  function nodeChild(...classes: string[]) {
    const node = document.createElement('div');
    node.classList.add('v-node', ...classes);
    const body = document.createElement('div');
    node.append(body);
    return body;
  }

  it('allows every event other than a pointer press', () => {
    expect(allowRootZoomForNodeTarget(new WheelEvent('wheel'), true)).toBe(true);
    expect(allowRootZoomForNodeTarget(new Event('touchstart'), true)).toBe(true);
  });

  it('rejects any press while the selection modifier is held', () => {
    expect(allowRootZoomForNodeTarget(pointerdownOn(document.createElement('div')), true)).toBe(false);
  });

  it('allows a press on the pane or on a node that does not drag, and rejects one that drags a node', () => {
    expect(allowRootZoomForNodeTarget(pointerdownOn(document.createElement('div')), false)).toBe(true);
    expect(allowRootZoomForNodeTarget(pointerdownOn(nodeChild('v-node--undraggable')), false)).toBe(true);
    expect(allowRootZoomForNodeTarget(pointerdownOn(nodeChild()), false)).toBe(false);
  });
});
