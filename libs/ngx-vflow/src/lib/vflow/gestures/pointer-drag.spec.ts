import { PointerDrag, PointerDragContext, createPointerDrag } from './pointer-drag';
import { dispatchPointer } from './pointer-events.testing';

describe('createPointerDrag', () => {
  let element: HTMLElement;
  let parent: HTMLElement;
  let calls: string[];
  let drag: PointerDrag | undefined;

  beforeEach(() => {
    // A drag swallows the click that follows it until a timer of zero runs.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    parent = document.createElement('div');
    element = document.createElement('div');
    parent.append(element);
    document.body.append(parent);
    calls = [];
  });

  afterEach(() => {
    drag?.destroy();
    drag = undefined;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    parent.remove();
  });

  function create(options: Parameters<typeof createPointerDrag>[1] = {}) {
    const record = (name: string) => (context: PointerDragContext) => calls.push(`${name}:${context.point.x}`);
    drag = createPointerDrag(element, {
      onStart: record('start'),
      onMove: record('move'),
      onEnd: record('end'),
      onCancel: record('cancel'),
      ...options,
    });
    return drag;
  }

  const press = (x = 0, init: { pointerType?: 'mouse' | 'touch' } = {}) =>
    dispatchPointer(element, 'pointerdown', { x, ...init });
  const move = (x: number, init: { pointerId?: number; pointerType?: 'mouse' | 'touch' } = {}) =>
    dispatchPointer(window, 'pointermove', { x, ...init });
  const release = (x: number, init: { pointerType?: 'mouse' | 'touch' } = {}) =>
    dispatchPointer(window, 'pointerup', { x, ...init });

  function clicks() {
    const counter = { count: 0 };
    element.addEventListener('click', () => counter.count++);
    return counter;
  }

  it('starts on the press without a threshold', () => {
    create();

    press(10);

    expect(calls).toEqual(['start:10']);
  });

  it('follows only the pointer that pressed', () => {
    create();
    press(10);

    move(20, { pointerId: 2 });
    move(30);

    expect(calls).toEqual(['start:10', 'move:30']);
  });

  it('ends on the release and stops tracking the press', () => {
    const drag = create();
    press(10);

    release(30);

    expect(calls).toEqual(['start:10', 'end:30']);
    expect(drag.pressed).toBe(false);
  });

  it('does not start or end a drag that stays within the threshold', () => {
    create({ threshold: () => 5 });

    press(10);
    move(15);
    release(15);

    expect(calls).toEqual([]);
  });

  it('starts with the move that crosses the threshold', () => {
    create({ threshold: () => 5 });

    press(10);
    move(16);
    move(20);

    expect(calls).toEqual(['start:16', 'move:20']);
  });

  it('stops an accepted press from propagating, without preventing its default', () => {
    let reached = 0;
    parent.addEventListener('pointerdown', () => reached++);
    create({ filter: () => true });

    const accepted = press();

    expect(reached).toBe(0);
    expect(accepted.defaultPrevented).toBe(false);
  });

  it('leaves a press the filter rejects alone', () => {
    let reached = 0;
    parent.addEventListener('pointerdown', () => reached++);
    create({ filter: () => false });

    press();

    expect(reached).toBe(1);
    expect(calls).toEqual([]);
  });

  it('keeps the compatibility mousedown of an accepted press inside the element on request', () => {
    let mousedowns = 0;
    parent.addEventListener('mousedown', () => mousedowns++);
    create({ stopCompatibilityEvents: true });

    press();
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(mousedowns).toBe(0);
  });

  it('lets a mousedown outside a press through', () => {
    let mousedowns = 0;
    parent.addEventListener('mousedown', () => mousedowns++);
    create({ stopCompatibilityEvents: true });
    press();
    release(0);

    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(mousedowns).toBe(1);
  });

  describe('click suppression', () => {
    beforeEach(() => create({ clickDistance: () => 3 }));

    it('keeps the click of a mouse drag within the click distance', () => {
      const counter = clicks();
      press();
      move(2);
      release(2);

      element.click();

      expect(counter.count).toBe(1);
    });

    it('suppresses the click of a mouse drag beyond the click distance', () => {
      const counter = clicks();
      press();
      move(5);
      release(5);

      element.click();

      expect(counter.count).toBe(0);
    });

    it('lets clicks through again once the click that follows the drag has passed', () => {
      const counter = clicks();
      press();
      move(5);
      release(5);

      vi.runAllTimers();
      element.click();

      expect(counter.count).toBe(1);
    });

    it('suppresses nothing after a touch drag, which produces no click', () => {
      const counter = clicks();
      press(0, { pointerType: 'touch' });
      move(5, { pointerType: 'touch' });
      release(5, { pointerType: 'touch' });

      element.click();

      expect(counter.count).toBe(1);
    });
  });

  describe('pointer capture', () => {
    let capture: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Synthetic pointers cannot be captured: the browser call is the boundary.
      capture = vi.spyOn(element, 'setPointerCapture').mockImplementation(() => undefined);
      create({ capture: true, clickDistance: () => 3 });
    });

    it('follows the pointer within the click distance without capturing it', () => {
      press();
      move(2);

      expect(calls).toEqual(['start:0', 'move:2']);
      expect(capture).not.toHaveBeenCalled();
    });

    it('captures the pointer once it moves beyond the click distance', () => {
      press();
      move(5);

      expect(capture).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('captures the pointer once per press', () => {
      press();
      move(5);
      move(1);
      move(6);

      expect(capture).toHaveBeenCalledOnce();
    });
  });

  it.each<[string, (drag: PointerDrag) => void, string]>([
    ['pointercancel', () => dispatchPointer(window, 'pointercancel', { x: 1 }), 'cancel:1'],
    // Without an event of its own, the cancellation reports the press.
    ['a lost window focus', () => window.dispatchEvent(new Event('blur')), 'cancel:0'],
    ['destroy', (drag) => drag.destroy(), 'cancel:0'],
  ])('cancels on %s and ignores later moves', (_, cancel, cancelled) => {
    const drag = create();
    press();

    cancel(drag);
    move(9);

    expect(calls).toEqual(['start:0', cancelled]);
  });

  it('ends a mouse drag at a move without pressed buttons', () => {
    create();
    press();

    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 7, buttons: 0 }),
    );

    expect(calls).toEqual(['start:0', 'end:7']);
  });

  it('prevents text selection and native drag while pressed', () => {
    create();
    press();
    const selectstart = new Event('selectstart', { bubbles: true, cancelable: true });
    const dragstart = new Event('dragstart', { bubbles: true, cancelable: true });

    element.dispatchEvent(selectstart);
    element.dispatchEvent(dragstart);

    expect([selectstart.defaultPrevented, dragstart.defaultPrevented]).toEqual([true, true]);
  });

  it('allows text selection again after the release', () => {
    create();
    press();
    release(0);
    const selectstart = new Event('selectstart', { bubbles: true, cancelable: true });

    element.dispatchEvent(selectstart);

    expect(selectstart.defaultPrevented).toBe(false);
  });
});
