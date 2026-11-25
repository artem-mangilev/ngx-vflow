import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { Vflow } from '../../vflow';
import { dispatchPointer, pointerDrag, touchPointers } from '../../gestures/pointer-events.testing';
import { createNode, Node } from '../../interfaces/node.interface';
import { ViewportState } from '../../interfaces/viewport.interface';
import { provideVflow } from '../../features/feature';
import { withShortcuts } from '../../features/with-shortcuts';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';

/** The keys of the flow under test, provided once; each test sets what it needs. */
const shortcuts = signal<KeyboardShortcuts>({});

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  template: `<div vNoDrag><input /></div>
    <div vNoPan><span></span></div>
    <div vNoWheel><textarea></textarea></div>`,
})
class ControlsComponent {}

describe('viewport gestures', () => {
  let fixture: ComponentFixture<VflowComponent> | undefined;
  let flow: VflowComponent;
  let pane: HTMLElement;

  /**
   * Renders a 400 x 300 flow with real timers, then mocks the clock: wheel easing, animations and the end of a wheel
   * gesture run on timers and animation frames, which a test advances.
   */
  async function setup(nodes: Node[] = []) {
    shortcuts.set({});
    TestBed.configureTestingModule({
      imports: [VflowComponent, ControlsComponent],
      providers: provideVflow(withShortcuts(shortcuts)),
    });
    fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', nodes);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.detectChanges();
    await fixture.whenStable();
    flow = fixture.componentInstance;
    pane = fixture.nativeElement.querySelector('.v-pane');
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
  }

  afterEach(() => {
    if (!fixture) return;
    window.dispatchEvent(new Event('blur'));
    // Ends wheel gestures and animations while the flow still exists.
    vi.runAllTimers();
    vi.useRealTimers();
    fixture = undefined;
  });

  function setInput(name: string, value: unknown) {
    fixture!.componentRef.setInput(name, value);
    fixture!.detectChanges();
  }

  function wheel(target: Element = pane, ctrlKey = false) {
    const event = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -40,
      clientX: 100,
      clientY: 100,
      ctrlKey,
      view: window,
    });
    target.dispatchEvent(event);
    return event;
  }

  function drag(button = 0, target: Element = pane) {
    pointerDrag(target, { x: 100 }, [{ x: 140 }], { button });
  }

  function dblclick(shiftKey = false) {
    pane.dispatchEvent(
      new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
        shiftKey,
        view: window,
      }),
    );
  }

  function key(type: string, code: string, target: EventTarget = document) {
    target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, code }));
  }

  function renderControls(parent: Element) {
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    parent.appendChild(controls.nativeElement);
    const element: HTMLElement = controls.nativeElement;
    return {
      input: element.querySelector('input')!,
      noPan: element.querySelector('span')!,
      textarea: element.querySelector('textarea')!,
    };
  }

  function changeEnds() {
    const ends: ViewportState[] = [];
    flow.viewportChangeEnd.subscribe((state) => ends.push(state));
    return ends;
  }

  function disableEveryGesture() {
    for (const input of ['panOnDrag', 'panOnScroll', 'zoomOnScroll', 'zoomOnPinch', 'zoomOnDoubleClick']) {
      fixture!.componentRef.setInput(input, false);
    }
    shortcuts.set({ modifiers: { panActivation: [], zoomActivation: [] } });
    fixture!.detectChanges();
  }

  describe('defaults', () => {
    it.each([0, 1, 2])('pans on a drag with mouse button %i', async (button) => {
      await setup();
      drag(button);
      expect(flow.viewport()).toEqual({ x: 40, y: 0, zoom: 1 });
    });

    it('zooms in on a wheel', async () => {
      await setup();
      wheel();
      expect(flow.viewport().zoom).toBeGreaterThan(1);
    });
  });

  describe('touch action of the pane', () => {
    it.each([
      { name: 'the defaults', inputs: {}, touchAction: 'none' },
      { name: 'drag pan disabled', inputs: { panOnDrag: false }, touchAction: 'pan-x pan-y' },
      { name: 'pinch zoom disabled', inputs: { zoomOnPinch: false }, touchAction: 'none' },
    ])('is $touchAction with $name', async ({ inputs, touchAction }) => {
      await setup();
      for (const [name, value] of Object.entries(inputs)) setInput(name, value);
      expect(pane.style.touchAction).toBe(touchAction);
    });

    it('is auto with every gesture disabled', async () => {
      await setup();
      disableEveryGesture();
      expect(pane.style.touchAction).toBe('auto');
    });
  });

  describe('with every gesture disabled', () => {
    it.each<{ name: string; perform: () => Event[] }>([
      {
        name: 'a drag',
        perform: () => {
          drag();
          return [];
        },
      },
      { name: 'a wheel', perform: () => [wheel()] },
      { name: 'a trackpad pinch', perform: () => [wheel(pane, true)] },
      {
        name: 'a double click',
        perform: () => {
          dblclick();
          return [];
        },
      },
      {
        name: 'a two-finger touch',
        perform: () => {
          touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 150 }]);
          const moves = touchPointers(pane, 'pointermove', [{ x: 80 }, { x: 170 }]);
          touchPointers(pane, 'pointerup', [{ x: 80 }, { x: 170 }]);
          return moves;
        },
      },
    ])('leaves $name to the page and the viewport in place', async ({ perform }) => {
      await setup();
      disableEveryGesture();
      const events = perform();
      vi.runAllTimers();
      expect(events.filter((event) => event.defaultPrevented)).toEqual([]);
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('scroll pan and activation keys', () => {
    it('pans on a wheel with scroll pan enabled', async () => {
      await setup();
      setInput('panOnScroll', true);
      wheel();
      expect(flow.viewport()).toEqual({ x: 0, y: 40, zoom: 1 });
    });

    it('zooms on a wheel with scroll pan enabled while the zoom activation key is held', async () => {
      await setup();
      setInput('panOnScroll', true);
      shortcuts.set({ modifiers: { zoomActivation: ['KeyZ'] } });
      key('keydown', 'KeyZ');
      wheel();
      expect(flow.viewport().zoom).toBeGreaterThan(1);
    });

    it('pans on a drag with drag pan disabled while the pan activation key is held', async () => {
      await setup();
      setInput('panOnDrag', false);
      shortcuts.set({ modifiers: { panActivation: ['Space'] } });
      key('keydown', 'Space');
      drag();
      expect(flow.viewport()).toEqual({ x: 40, y: 0, zoom: 1 });
    });

    it('ignores an activation key pressed in an editable element', async () => {
      await setup();
      setInput('panOnScroll', true);
      shortcuts.set({ modifiers: { zoomActivation: ['ControlLeft'] } });
      const input = document.createElement('input');
      pane.appendChild(input);
      key('keydown', 'ControlLeft', input);
      wheel();
      expect(flow.viewport().zoom).toBe(1);
    });

    it('releases a held activation key when the window loses focus', async () => {
      await setup();
      setInput('panOnScroll', true);
      shortcuts.set({ modifiers: { zoomActivation: ['ControlLeft'] } });
      key('keydown', 'ControlLeft');
      window.dispatchEvent(new Event('blur'));
      wheel();
      expect(flow.viewport().zoom).toBe(1);
    });

    it('drags a draggable node, not the viewport, while the pan activation key is held', async () => {
      const node = createNode({ id: 'node', point: { x: 0, y: 0 } });
      await setup([node]);
      shortcuts.set({ modifiers: { panActivation: ['Space'] } });
      key('keydown', 'Space');
      drag(0, pane.querySelector('[data-v-node]')!);
      expect(node.point()).toEqual({ x: 40, y: 0 });
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('mouse buttons of drag pan', () => {
    it('does not pan on a drag with a button left out of the list', async () => {
      await setup();
      setInput('panOnDrag', [1]);
      drag(0);
      expect(flow.viewport().x).toBe(0);
    });

    it('pans on a drag with a listed button', async () => {
      await setup();
      setInput('panOnDrag', [1]);
      drag(1);
      expect(flow.viewport().x).toBe(40);
    });

    it('gives the selection key priority over a pan activation key bound to the same key', async () => {
      await setup();
      setInput('panOnDrag', [1]);
      shortcuts.set({ modifiers: { selection: ['Space'], panActivation: ['Space'] } });
      key('keydown', 'Space');
      drag(1);
      expect(flow.viewport().x).toBe(0);
    });
  });

  describe('opt-out directives', () => {
    it('starts no pan from inside vNoDrag', async () => {
      await setup();
      drag(0, renderControls(pane).input);
      expect(flow.viewport().x).toBe(0);
    });

    it('starts no pan from inside vNoPan', async () => {
      await setup();
      drag(0, renderControls(pane).noPan);
      expect(flow.viewport().x).toBe(0);
    });

    it('does not scroll-pan on a wheel inside vNoPan', async () => {
      await setup();
      setInput('panOnScroll', true);
      wheel(renderControls(pane).noPan);
      expect(flow.viewport().y).toBe(0);
    });

    it.each([
      { name: 'a wheel', ctrlKey: false },
      { name: 'a trackpad pinch', ctrlKey: true },
    ])('leaves $name inside vNoWheel to the element', async ({ ctrlKey }) => {
      await setup();
      expect(wheel(renderControls(pane).textarea, ctrlKey).defaultPrevented).toBe(false);
      expect(flow.viewport().zoom).toBe(1);
    });

    it('keeps touchscreen pinch available inside vNoPan', async () => {
      await setup();
      const target = renderControls(pane).noPan;
      touchPointers(target, 'pointerdown', [{ x: 100 }, { x: 200 }]);
      touchPointers(target, 'pointermove', [{ x: 90 }, { x: 230 }]);
      expect(flow.viewport().zoom).toBeCloseTo(1.4);
      // Scales around the initial midpoint without the 10px pan of the midpoint.
      expect(flow.viewport().x).toBeCloseTo(-60);
      touchPointers(target, 'pointerup', [{ x: 90 }, { x: 230 }]);
    });

    it('starts no gesture from an opted-out control inside a draggable node', async () => {
      const node = createNode({ id: 'node', point: { x: 0, y: 0 } });
      await setup([node]);
      const { input } = renderControls(pane.querySelector('[data-v-node]')!);
      const events = [
        dispatchPointer(input, 'pointerdown', { x: 100, pointerType: 'touch', pointerId: 10 }),
        dispatchPointer(window, 'pointermove', { x: 100, y: 140, pointerType: 'touch', pointerId: 10 }),
        dispatchPointer(window, 'pointerup', { x: 100, y: 140, pointerType: 'touch', pointerId: 10 }),
      ];
      expect(events.filter((event) => event.defaultPrevented)).toEqual([]);
      expect(node.point()).toEqual({ x: 0, y: 0 });
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('wheel zoom', () => {
    const target = 2 ** (0.002 * 40 * 2);

    it('takes the first easing step at once, short of the target', async () => {
      await setup();
      wheel();
      wheel();
      expect(flow.viewport().zoom).toBeGreaterThan(1);
      expect(flow.viewport().zoom).toBeLessThan(target);
    });

    it('eases to the accumulated target around the pointer', async () => {
      await setup();
      const { left, top } = pane.getBoundingClientRect();
      wheel();
      wheel();
      vi.advanceTimersByTime(500);
      expect(flow.viewport().zoom).toBeCloseTo(target, 10);
      expect(flow.viewport().x).toBeCloseTo((100 - left) * (1 - target), 6);
      expect(flow.viewport().y).toBeCloseTo((100 - top) * (1 - target), 6);
    });

    it('applies a trackpad pinch at once', async () => {
      await setup();
      wheel(pane, true);
      expect(flow.viewport().zoom).toBeCloseTo(2 ** (0.002 * 40 * 10), 10);
    });

    it('leaves a new outward wheel gesture at the zoom limit to the page', async () => {
      await setup();
      flow.zoomTo(3);
      expect(wheel().defaultPrevented).toBe(false);
      expect(flow.viewport().zoom).toBe(3);
    });

    it('keeps a trackpad pinch at the zoom limit from zooming the page', async () => {
      await setup();
      flow.zoomTo(3);
      expect(wheel(pane, true).defaultPrevented).toBe(true);
      expect(flow.viewport().zoom).toBe(3);
    });
  });

  describe('touch', () => {
    it('pans with one finger', async () => {
      await setup();
      touchPointers(pane, 'pointerdown', [{ x: 100 }]);
      touchPointers(pane, 'pointermove', [{ x: 130, y: 120 }]);
      expect(flow.viewport()).toEqual({ x: 30, y: 20, zoom: 1 });
      touchPointers(pane, 'pointerup', [{ x: 130, y: 120 }]);
    });

    it('zooms two fingers around their middle', async () => {
      await setup();
      const { left, top } = pane.getBoundingClientRect();
      touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
      touchPointers(pane, 'pointermove', [{ x: 50 }, { x: 250 }]);
      expect(flow.viewport().zoom).toBe(2);
      expect(flow.viewport().x).toBeCloseTo(left - 150);
      expect(flow.viewport().y).toBeCloseTo(top - 100);
      touchPointers(pane, 'pointerup', [{ x: 50 }, { x: 250 }]);
    });

    it('keeps the flow point under the remaining finger when one of two lifts', async () => {
      await setup();
      const { left, top } = pane.getBoundingClientRect();
      touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
      touchPointers(pane, 'pointermove', [{ x: 50 }, { x: 250 }]);
      touchPointers(pane, 'pointerup', [{ x: 50 }]);
      dispatchPointer(window, 'pointermove', { x: 260, pointerType: 'touch', pointerId: 11 });
      expect(flow.viewport().zoom).toBe(2);
      expect(flow.viewport().x).toBeCloseTo(left - 140);
      expect(flow.viewport().y).toBeCloseTo(top - 100);
      dispatchPointer(window, 'pointerup', { x: 260, pointerType: 'touch', pointerId: 11 });
    });

    it('zooms on a pinch with drag pan disabled', async () => {
      await setup();
      setInput('panOnDrag', false);
      touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
      touchPointers(pane, 'pointermove', [{ x: 80 }, { x: 220 }]);
      expect(flow.viewport().zoom).toBeCloseTo(1.4);
      touchPointers(pane, 'pointerup', [{ x: 80 }, { x: 220 }]);
    });

    it('pans with two fingers with pinch zoom disabled', async () => {
      await setup();
      setInput('zoomOnPinch', false);
      touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
      touchPointers(pane, 'pointermove', [{ x: 90 }, { x: 230 }]);
      expect(flow.viewport().zoom).toBe(1);
      expect(flow.viewport().x).toBeCloseTo(10);
      touchPointers(pane, 'pointerup', [{ x: 90 }, { x: 230 }]);
    });
  });

  describe('double click zoom', () => {
    it('does not zoom on a double click by default', async () => {
      await setup();
      dblclick();
      vi.runAllTimers();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('zooms in around the pointer once enabled after initialization', async () => {
      await setup();
      setInput('zoomOnDoubleClick', true);
      const { left, top } = pane.getBoundingClientRect();
      dblclick();
      vi.runAllTimers();
      expect(flow.viewport()).toEqual({ x: left - 100, y: top - 100, zoom: 2 });
    });

    it('zooms out around the pointer on a double click with Shift', async () => {
      await setup();
      setInput('zoomOnDoubleClick', true);
      const { left, top } = pane.getBoundingClientRect();
      flow.setViewport({ x: left - 100, y: top - 100, zoom: 2 });
      dblclick(true);
      vi.runAllTimers();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('zooms in on a touch double tap', async () => {
      await setup();
      setInput('zoomOnDoubleClick', true);
      const { left, top } = pane.getBoundingClientRect();
      for (let tap = 0; tap < 2; tap++) {
        touchPointers(pane, 'pointerdown', [{ x: 100 }]);
        touchPointers(pane, 'pointerup', [{ x: 100 }]);
      }
      vi.runAllTimers();
      expect(flow.viewport()).toEqual({ x: left - 100, y: top - 100, zoom: 2 });
    });
  });

  describe('change end', () => {
    it('reports a series of wheel zoom events once, after the zoom settled, with the viewport', async () => {
      await setup();
      const ends = changeEnds();
      wheel();
      wheel();
      wheel();
      expect(ends).toEqual([]);
      vi.runAllTimers();
      expect(ends).toEqual([flow.viewport()]);
    });

    it('reports a series of wheel pan events once, after the events stopped', async () => {
      await setup();
      setInput('panOnScroll', true);
      const ends = changeEnds();
      for (let i = 0; i < 5; i++) wheel();
      expect(ends).toEqual([]);
      vi.runAllTimers();
      expect(ends).toEqual([{ x: 0, y: 200, zoom: 1 }]);
    });

    it('reports a series that both pans and zooms as one gesture', async () => {
      await setup();
      setInput('panOnScroll', true);
      const ends = changeEnds();
      wheel();
      wheel(pane, true);
      wheel();
      vi.runAllTimers();
      expect(ends).toEqual([flow.viewport()]);
    });

    it('reports a drag pan once, with the viewport it left', async () => {
      await setup();
      const ends = changeEnds();
      drag();
      expect(ends).toEqual([{ x: 40, y: 0, zoom: 1 }]);
    });
  });

  describe('pane click', () => {
    it.each([
      { distance: 2, outcome: 'keeps', selected: true },
      { distance: 6, outcome: 'clears', selected: false },
    ])('$outcome the selection on a 4px press with pane click distance $distance', async ({ distance, selected }) => {
      const node = createNode({ id: 'node', point: { x: 200, y: 200 }, selected: true });
      await setup([node]);
      setInput('paneClickDistance', distance);
      pointerDrag(pane, { x: 100 }, [{ x: 104 }]);
      expect(node.selected()).toBe(selected);
    });

    it('keeps the selection on a press on a node', async () => {
      const node = createNode({ id: 'node', point: { x: 0, y: 0 }, selected: true, draggable: false });
      await setup([node]);
      const { left, top } = pane.querySelector('[data-v-node]')!.getBoundingClientRect();
      pointerDrag(pane.querySelector('[data-v-node]')!, { x: left + 5, y: top + 5 }, [{ x: left + 6, y: top + 5 }]);
      expect(node.selected()).toBe(true);
    });

    it('pans along with a press that moves within the pane click distance', async () => {
      await setup();
      const control = pane.appendChild(document.createElement('button'));
      pointerDrag(control, { x: 100 }, [{ x: 103 }]);
      expect(flow.viewport().x).toBe(3);
    });

    it('keeps the pointer on the pressed element while the press moves within the pane click distance', async () => {
      await setup();
      const control = pane.appendChild(document.createElement('button'));
      const capture = vi.spyOn(pane, 'setPointerCapture').mockImplementation(() => undefined);
      pointerDrag(control, { x: 100 }, [{ x: 103 }]);
      expect(capture).not.toHaveBeenCalled();
    });

    it('keeps the click of a press that moves within the pane click distance', async () => {
      await setup();
      const control = pane.appendChild(document.createElement('button'));
      let clicks = 0;
      control.addEventListener('click', () => clicks++);
      pointerDrag(control, { x: 100 }, [{ x: 103 }]);
      control.click();
      expect(clicks).toBe(1);
    });

    it('suppresses the click of a press that moves beyond the pane click distance', async () => {
      await setup();
      setInput('paneClickDistance', 2);
      const control = pane.appendChild(document.createElement('button'));
      vi.spyOn(pane, 'setPointerCapture').mockImplementation(() => undefined);
      let clicks = 0;
      control.addEventListener('click', () => clicks++);
      pointerDrag(control, { x: 100 }, [{ x: 103 }]);
      control.click();
      expect(clicks).toBe(0);
    });

    it('suppresses the click after a pan', async () => {
      await setup();
      let clicks = 0;
      pane.addEventListener('click', () => clicks++);
      drag();
      pane.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(clicks).toBe(0);
    });

    it('keeps the click of a press without movement', async () => {
      await setup();
      let clicks = 0;
      pane.addEventListener('click', () => clicks++);
      pointerDrag(pane, { x: 100 }, []);
      pane.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(clicks).toBe(1);
    });
  });
});
