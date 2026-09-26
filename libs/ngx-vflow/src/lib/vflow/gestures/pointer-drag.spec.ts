import { PointerDragContext, createPointerDrag } from './pointer-drag';
import { dispatchPointer } from './pointer-events.testing';

describe('createPointerDrag', () => {
  let element: HTMLElement;
  let parent: HTMLElement;
  let calls: string[];

  beforeEach(() => {
    parent = document.createElement('div');
    element = document.createElement('div');
    parent.append(element);
    document.body.append(parent);
    calls = [];
  });

  afterEach(() => parent.remove());

  function create(options: Parameters<typeof createPointerDrag>[1] = {}) {
    const record = (name: string) => (context: PointerDragContext) => calls.push(`${name}:${context.point.x}`);
    return createPointerDrag(element, {
      onStart: record('start'),
      onMove: record('move'),
      onEnd: record('end'),
      onCancel: record('cancel'),
      ...options,
    });
  }

  const wait = () => new Promise((resolve) => setTimeout(resolve));

  it('starts on the press without a threshold and follows only its own pointer', () => {
    const drag = create();
    dispatchPointer(element, 'pointerdown', { x: 10 });
    dispatchPointer(window, 'pointermove', { x: 20, pointerId: 2 });
    dispatchPointer(window, 'pointermove', { x: 30 });
    dispatchPointer(window, 'pointerup', { x: 30 });
    expect(calls).toEqual(['start:10', 'move:30', 'end:30']);
    expect(drag.pressed).toBeFalse();
    drag.destroy();
  });

  it('starts past the threshold with the crossing move and never ends a drag that did not start', () => {
    const drag = create({ threshold: () => 5 });
    dispatchPointer(element, 'pointerdown', { x: 10 });
    dispatchPointer(window, 'pointermove', { x: 15 });
    dispatchPointer(window, 'pointerup', { x: 15 });
    expect(calls).toEqual([]);
    dispatchPointer(element, 'pointerdown', { x: 10 });
    dispatchPointer(window, 'pointermove', { x: 16 });
    dispatchPointer(window, 'pointermove', { x: 20 });
    dispatchPointer(window, 'pointerup', { x: 20 });
    expect(calls).toEqual(['start:16', 'move:20', 'end:20']);
    drag.destroy();
  });

  it('stops an accepted press from propagating and leaves a rejected one alone', () => {
    let reached = 0;
    parent.addEventListener('pointerdown', () => reached++);
    let accept = false;
    const drag = create({ filter: () => accept });
    dispatchPointer(element, 'pointerdown', { x: 0 });
    dispatchPointer(window, 'pointerup', { x: 0 });
    accept = true;
    const press = dispatchPointer(element, 'pointerdown', { x: 0 });
    dispatchPointer(window, 'pointerup', { x: 0 });
    expect(reached).toBe(1);
    expect(press.defaultPrevented).toBeFalse();
    drag.destroy();
  });

  it('keeps the compatibility mousedown of an accepted press inside the element on request', () => {
    let mousedowns = 0;
    parent.addEventListener('mousedown', () => mousedowns++);
    const drag = create({ stopCompatibilityEvents: true });
    dispatchPointer(element, 'pointerdown', { x: 0 });
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    dispatchPointer(window, 'pointerup', { x: 0 });
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(mousedowns).toBe(1);
    drag.destroy();
  });

  it('suppresses the click after a mouse drag beyond the click distance only', async () => {
    let clicks = 0;
    element.addEventListener('click', () => clicks++);
    const drag = create({ clickDistance: () => 3 });
    dispatchPointer(element, 'pointerdown', { x: 0 });
    dispatchPointer(window, 'pointermove', { x: 2 });
    dispatchPointer(window, 'pointerup', { x: 2 });
    element.click();
    expect(clicks).toBe(1);
    dispatchPointer(element, 'pointerdown', { x: 0 });
    dispatchPointer(window, 'pointermove', { x: 5 });
    dispatchPointer(window, 'pointerup', { x: 5 });
    element.click();
    expect(clicks).toBe(1);
    await wait();
    element.click();
    expect(clicks).toBe(2);
    // A touch drag does not produce a click to suppress.
    dispatchPointer(element, 'pointerdown', { x: 0, pointerType: 'touch' });
    dispatchPointer(window, 'pointermove', { x: 5, pointerType: 'touch' });
    dispatchPointer(window, 'pointerup', { x: 5, pointerType: 'touch' });
    element.click();
    expect(clicks).toBe(3);
    drag.destroy();
  });

  it('cancels on pointercancel, window blur and destroy, and ends a mouse drag without pressed buttons', () => {
    const drag = create();
    dispatchPointer(element, 'pointerdown', { x: 0 });
    dispatchPointer(window, 'pointercancel', { x: 1 });
    dispatchPointer(element, 'pointerdown', { x: 0 });
    window.dispatchEvent(new Event('blur'));
    dispatchPointer(element, 'pointerdown', { x: 0 });
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 7, buttons: 0 }),
    );
    dispatchPointer(element, 'pointerdown', { x: 0 });
    drag.destroy();
    dispatchPointer(window, 'pointermove', { x: 9 });
    expect(calls).toEqual(['start:0', 'cancel:1', 'start:0', 'cancel:0', 'start:0', 'end:7', 'start:0', 'cancel:0']);
  });

  it('prevents text selection and native drag while pressed', () => {
    const drag = create();
    dispatchPointer(element, 'pointerdown', { x: 0 });
    const selectstart = new Event('selectstart', { bubbles: true, cancelable: true });
    const dragstart = new Event('dragstart', { bubbles: true, cancelable: true });
    element.dispatchEvent(selectstart);
    element.dispatchEvent(dragstart);
    dispatchPointer(window, 'pointerup', { x: 0 });
    const after = new Event('selectstart', { bubbles: true, cancelable: true });
    element.dispatchEvent(after);
    expect([selectstart.defaultPrevented, dragstart.defaultPrevented, after.defaultPrevented]).toEqual([
      true,
      true,
      false,
    ]);
    drag.destroy();
  });
});
