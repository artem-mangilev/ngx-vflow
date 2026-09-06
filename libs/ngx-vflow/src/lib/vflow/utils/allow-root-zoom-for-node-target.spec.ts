import { allowRootZoomForNodeTarget } from './allow-root-zoom-for-node-target';

describe('allowRootZoomForNodeTarget', () => {
  it('returns true for wheel-like events', () => {
    const ev = new WheelEvent('wheel');
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false in selection keyboard mode for pointer down', () => {
    const el = document.createElement('div');
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: el, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, true)).toBe(false);
  });

  it('returns true when target is outside any node', () => {
    const el = document.createElement('div');
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: el, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns true for undraggable node body', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--undraggable');
    const inner = document.createElement('div');
    node.appendChild(inner);
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: inner, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false for fully draggable node (no pan classes)', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node');
    const inner = document.createElement('div');
    node.appendChild(inner);
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: inner, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(false);
  });

  it('returns true for drag-handles-only node when not on a drag handle', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--drag-handles-only');
    const body = document.createElement('div');
    node.appendChild(body);
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: body, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false for drag-handles-only node when on vflow-drag-handle', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--drag-handles-only');
    const handle = document.createElement('button');
    handle.classList.add('vflow-drag-handle');
    node.appendChild(handle);
    const ev = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: handle, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(false);
  });

  it('handles touchstart like mousedown', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--undraggable');
    const inner = document.createElement('div');
    node.appendChild(inner);
    const ev = new Event('touchstart', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: inner, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });
});
