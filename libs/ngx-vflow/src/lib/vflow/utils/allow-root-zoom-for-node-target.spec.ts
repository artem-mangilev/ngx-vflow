import { allowRootZoomForNodeTarget } from './allow-root-zoom-for-node-target';

describe('allowRootZoomForNodeTarget', () => {
  it('returns true for wheel-like events', () => {
    const ev = new WheelEvent('wheel');
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false in selection keyboard mode for pointer down', () => {
    const el = document.createElement('div');
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: el, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, true)).toBe(false);
  });

  it('returns true when target is outside any node', () => {
    const el = document.createElement('div');
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: el, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns true for undraggable node body', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--undraggable');
    const inner = document.createElement('div');
    node.appendChild(inner);
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: inner, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false for fully draggable node (no pan classes)', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node');
    const inner = document.createElement('div');
    node.appendChild(inner);
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: inner, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(false);
  });

  it('returns true for drag-handles-only node when not on a drag handle', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--drag-handles-only');
    const body = document.createElement('div');
    node.appendChild(body);
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: body, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(true);
  });

  it('returns false for drag-handles-only node when on vflow-drag-handle', () => {
    const node = document.createElement('g');
    node.classList.add('vflow-node', 'vflow-node--drag-handles-only');
    const handle = document.createElement('button');
    handle.classList.add('vflow-drag-handle');
    node.appendChild(handle);
    const ev = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(ev, 'target', { value: handle, enumerable: true });
    expect(allowRootZoomForNodeTarget(ev, false)).toBe(false);
  });

  it('returns false inside a handle of an undraggable node and true from a drag handle inside that handle', () => {
    const node = document.createElement('div');
    node.classList.add('vflow-node', 'vflow-node--drag-handles-only');
    const handle = document.createElement('div');
    handle.classList.add('vflow-handle');
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('vflow-drag-handle');
    const body = document.createElement('span');
    node.append(handle);
    handle.append(dragHandle, body);
    document.body.append(node);

    const onBody = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(onBody, 'target', { value: body, enumerable: true });
    expect(allowRootZoomForNodeTarget(onBody, false)).toBe(false);

    const onDragHandle = new PointerEvent('pointerdown', { bubbles: true });
    Object.defineProperty(onDragHandle, 'target', { value: dragHandle, enumerable: true });
    expect(allowRootZoomForNodeTarget(onDragHandle, false)).toBe(false);

    node.remove();
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
