import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { Vflow } from '../../vflow';
import { dispatchPointer, pointerDrag, touchPointers } from '../../gestures/pointer-events.testing';
import { ViewportService } from '../../services/viewport.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  template: `<div vflowNoDrag><input /></div>
    <div vflowNoPan><span></span></div>
    <div vflowNoWheel><textarea></textarea></div>`,
})
class ControlsComponent {}

describe('public viewport gesture settings', () => {
  let fixture: ComponentFixture<VflowComponent>;
  let flow: VflowComponent;
  let pane: HTMLElement;
  const pause = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [VflowComponent, ControlsComponent],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.detectChanges();
    await fixture.whenStable();
    flow = fixture.componentInstance;
    pane = fixture.nativeElement.querySelector('.vflow-pane');
  });

  afterEach(async () => {
    window.dispatchEvent(new Event('blur'));
    await pause(); // Let the wheel gesture end before destroying the fixture.
  });

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

  function dblclick(x = 100, shiftKey = false) {
    pane.dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: x, clientY: 100, shiftKey, view: window }),
    );
  }

  function key(type: string, code: string, target: EventTarget = document) {
    target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, code }));
  }

  async function settle() {
    fixture.detectChanges();
    await pause(50);
  }

  it('preserves ordinary wheel zoom and all-button drag defaults', () => {
    drag(2);
    expect(flow.viewport().x).toBe(40);
    wheel();
    expect(flow.viewport().zoom).toBeGreaterThan(1);
  });

  it('gives scroll pan priority, with opt-in zoom and pan activation keys', () => {
    flow.panOnScroll = true;
    flow.keyboardShortcuts = { modifiers: { zoomActivation: ['KeyZ'], panActivation: ['Space'] } };
    wheel();
    expect(flow.viewport()).toEqual({ x: 0, y: 40, zoom: 1 });
    key('keydown', 'KeyZ');
    wheel();
    expect(flow.viewport().zoom).toBeGreaterThan(1);
    key('keyup', 'KeyZ');
    flow.panOnDrag = false;
    key('keydown', 'Space');
    const x = flow.viewport().x;
    drag();
    expect(flow.viewport().x).toBe(x + 40);
  });

  it('disables every user gesture without disabling programmatic viewport operations', async () => {
    flow.panOnDrag = false;
    flow.panOnScroll = false;
    flow.zoomOnScroll = false;
    flow.zoomOnPinch = false;
    flow.zoomOnDoubleClick = false;
    flow.keyboardShortcuts = { modifiers: { panActivation: [], zoomActivation: [] } };
    fixture.detectChanges();
    expect(pane.style.touchAction).toBe('auto');
    drag();
    expect(wheel().defaultPrevented).toBeFalse();
    expect(wheel(pane, true).defaultPrevented).toBeFalse();
    dblclick();
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 150 }]);
    expect(touchPointers(pane, 'pointermove', [{ x: 80 }, { x: 170 }]).some((e) => e.defaultPrevented)).toBeFalse();
    touchPointers(pane, 'pointerup', [{ x: 80 }, { x: 170 }]);
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    flow.viewportTo({ x: 20, y: 30, zoom: 2 });
    await settle();
    expect(flow.viewport()).toEqual({ x: 20, y: 30, zoom: 2 });
    flow.panTo({ x: 40, y: 50 });
    await settle();
    expect(flow.viewport()).toEqual({ x: 40, y: 50, zoom: 2 });
    flow.zoomTo(1);
    await settle();
    expect(flow.viewport().zoom).toBe(1);
  });

  it('restricts mouse buttons and gives selection priority over pan activation', () => {
    flow.panOnDrag = [1];
    drag();
    expect(flow.viewport().x).toBe(0);
    drag(1);
    expect(flow.viewport().x).toBe(40);
    flow.keyboardShortcuts = { modifiers: { selection: ['Space'], panActivation: ['Space'] } };
    key('keydown', 'Space');
    drag(1);
    expect(flow.viewport().x).toBe(40);
  });

  it('applies public exclusion directives to descendants and preserves native wheel handling', () => {
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    pane.appendChild(controls.nativeElement);
    const input = controls.nativeElement.querySelector('input');
    const span = controls.nativeElement.querySelector('span');
    const textarea = controls.nativeElement.querySelector('textarea');
    drag(0, input);
    drag(0, span);
    expect(flow.viewport().x).toBe(0);
    flow.panOnScroll = true;
    wheel(span);
    expect(flow.viewport().y).toBe(0);
    expect(wheel(textarea).defaultPrevented).toBeFalse();
    expect(wheel(textarea, true).defaultPrevented).toBeFalse();
    expect(flow.viewport().zoom).toBe(1);
    controls.destroy();
  });

  it('ignores activation from editable targets and clears activation on window blur', () => {
    flow.panOnScroll = true;
    flow.keyboardShortcuts = { modifiers: { zoomActivation: ['ControlLeft'] } };
    const input = document.createElement('input');
    pane.appendChild(input);
    key('keydown', 'ControlLeft', input);
    wheel();
    expect(flow.viewport().zoom).toBe(1);
    key('keyup', 'ControlLeft');
    key('keydown', 'ControlLeft');
    window.dispatchEvent(new Event('blur'));
    wheel();
    expect(flow.viewport().zoom).toBe(1);
  });

  it('keeps draggable nodes draggable while pan activation is held', async () => {
    const { createNode } = await import('../../interfaces/node.interface');
    const node = createNode({ id: 'node', point: { x: 0, y: 0 } });
    fixture.componentRef.setInput('nodes', [node]);
    fixture.detectChanges();
    await fixture.whenStable();
    flow.keyboardShortcuts = { modifiers: { panActivation: ['Space'] } };
    key('keydown', 'Space');
    drag(0, pane.querySelector('.vflow-node')!);
    expect(node.point()).toEqual({ x: 40, y: 0 });
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('starts no gesture from an opted-out control inside a draggable node', async () => {
    const { createNode } = await import('../../interfaces/node.interface');
    const node = createNode({ id: 'node', point: { x: 0, y: 0 } });
    fixture.componentRef.setInput('nodes', [node]);
    fixture.detectChanges();
    await fixture.whenStable();
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    const host = pane.querySelector('.vflow-node') as HTMLElement;
    host.appendChild(controls.nativeElement);
    const input = controls.nativeElement.querySelector('input');
    const events = [
      dispatchPointer(input, 'pointerdown', { x: 100, pointerType: 'touch', pointerId: 10 }),
      dispatchPointer(window, 'pointermove', { x: 100, y: 140, pointerType: 'touch', pointerId: 10 }),
      dispatchPointer(window, 'pointerup', { x: 100, y: 140, pointerType: 'touch', pointerId: 10 }),
    ];
    expect(events.some((event) => event.defaultPrevented)).toBeFalse();
    expect(node.point()).toEqual({ x: 0, y: 0 });
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    controls.destroy();
  });

  it('keeps touchscreen pinch available inside a no-pan region', () => {
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    pane.appendChild(controls.nativeElement);
    const target = controls.nativeElement.querySelector('span');
    touchPointers(target, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(target, 'pointermove', [{ x: 90 }, { x: 230 }]);
    expect(flow.viewport().zoom).toBeCloseTo(1.4);
    // Scale around the initial midpoint without the additional 10px pan.
    expect(flow.viewport().x).toBeCloseTo(-60);
    touchPointers(target, 'pointerup', [{ x: 90 }, { x: 230 }]);
    controls.destroy();
  });

  it('preserves page scrolling for a new outward wheel gesture at the zoom limit', async () => {
    flow.zoomTo(3);
    await settle();
    expect(wheel().defaultPrevented).toBeFalse();
    expect(flow.viewport().zoom).toBe(3);
  });

  it('uses the configured pane click tolerance to clear selection', async () => {
    const { createNode } = await import('../../interfaces/node.interface');
    const node = createNode({ id: 'node', point: { x: 200, y: 200 }, selected: true });
    fixture.componentRef.setInput('nodes', [node]);
    fixture.detectChanges();
    await fixture.whenStable();
    flow.paneClickDistance = 2;
    pointerDrag(pane, { x: 100 }, [{ x: 104 }]);
    expect(node.selected()).toBeTrue();
    flow.paneClickDistance = 6;
    pointerDrag(pane, { x: 100 }, [{ x: 104 }]);
    expect(node.selected()).toBeFalse();
  });

  it('allows touchscreen pinch with drag pan disabled', () => {
    flow.panOnDrag = false;
    fixture.detectChanges();
    expect(pane.style.touchAction).toBe('pan-x pan-y');
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(pane, 'pointermove', [{ x: 80 }, { x: 220 }]);
    expect(flow.viewport().zoom).toBeCloseTo(1.4);
    touchPointers(pane, 'pointerup', [{ x: 80 }, { x: 220 }]);
  });

  it('allows touchscreen pan while pinch zoom is disabled', () => {
    flow.zoomOnPinch = false;
    fixture.detectChanges();
    expect(pane.style.touchAction).toBe('none');
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(pane, 'pointermove', [{ x: 90 }, { x: 230 }]);
    expect(flow.viewport().zoom).toBe(1);
    expect(flow.viewport().x).toBeCloseTo(10);
    touchPointers(pane, 'pointerup', [{ x: 90 }, { x: 230 }]);
  });

  it('pans with one finger and zooms two fingers around their middle', () => {
    touchPointers(pane, 'pointerdown', [{ x: 100 }]);
    touchPointers(pane, 'pointermove', [{ x: 130, y: 120 }]);
    expect(flow.viewport()).toEqual({ x: 30, y: 20, zoom: 1 });
    touchPointers(pane, 'pointerup', [{ x: 130, y: 120 }]);
    flow.viewportTo({ x: 0, y: 0, zoom: 1 });
    fixture.detectChanges();
    const { left, top } = pane.getBoundingClientRect();
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(pane, 'pointermove', [{ x: 50 }, { x: 250 }]);
    expect(flow.viewport().zoom).toBe(2);
    expect(flow.viewport().x).toBeCloseTo(left - 150);
    expect(flow.viewport().y).toBeCloseTo(top - 100);
    // Lifting one finger keeps the other one holding the flow point under it.
    touchPointers(pane, 'pointerup', [{ x: 50 }]);
    dispatchPointer(window, 'pointermove', { x: 260, pointerType: 'touch', pointerId: 11 });
    expect(flow.viewport().zoom).toBe(2);
    expect(flow.viewport().x).toBeCloseTo(left - 140);
    expect(flow.viewport().y).toBeCloseTo(top - 100);
    dispatchPointer(window, 'pointerup', { x: 260, pointerType: 'touch', pointerId: 11 });
  });

  it('toggles double-click zoom after initialization', async () => {
    dblclick();
    await pause(300);
    expect(flow.viewport().zoom).toBe(1);
    flow.zoomOnDoubleClick = true;
    const { left, top } = pane.getBoundingClientRect();
    dblclick();
    await pause(300);
    expect(flow.viewport()).toEqual({ x: left - 100, y: top - 100, zoom: 2 });
    dblclick(100, true);
    await pause(300);
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('zooms on a touch double tap when double-click zoom is enabled', async () => {
    flow.zoomOnDoubleClick = true;
    for (let tap = 0; tap < 2; tap++) {
      touchPointers(pane, 'pointerdown', [{ x: 100 }]);
      touchPointers(pane, 'pointerup', [{ x: 100 }]);
    }
    await pause(300);
    const { left, top } = pane.getBoundingClientRect();
    expect(flow.viewport()).toEqual({ x: left - 100, y: top - 100, zoom: 2 });
  });

  it('reports one gesture end per wheel gesture and per programmatic change', async () => {
    const viewportService = fixture.debugElement.injector.get(ViewportService);
    let ends = 0;
    viewportService.viewportChangeEnd$.subscribe(() => ends++);
    wheel();
    wheel();
    wheel();
    expect(ends).toBe(0);
    await pause(200);
    expect(ends).toBe(1);
    flow.zoomTo(2);
    await settle();
    expect(ends).toBe(2);
  });

  it('zooms programmatically around the pane center and clamps only zoomTo', async () => {
    flow.zoomTo(2);
    await settle();
    expect(flow.viewport()).toEqual({ x: -200, y: -150, zoom: 2 });
    flow.zoomTo(10);
    await settle();
    expect(flow.viewport().zoom).toBe(3);
    flow.viewportTo({ x: 5, y: 6, zoom: 10 });
    await settle();
    expect(flow.viewport()).toEqual({ x: 5, y: 6, zoom: 10 });
  });

  it('animates programmatic changes to their exact end and lets a press interrupt them', async () => {
    const viewportService = fixture.debugElement.injector.get(ViewportService);
    viewportService.writableViewport.set({ changeType: 'absolute', state: { x: 100, y: 50, zoom: 2 }, duration: 200 });
    fixture.detectChanges();
    await pause(100);
    const middle = flow.viewport();
    expect(middle.zoom).toBeGreaterThan(1);
    expect(middle.zoom).toBeLessThan(2);
    await pause(250);
    expect(flow.viewport()).toEqual({ x: 100, y: 50, zoom: 2 });

    viewportService.writableViewport.set({ changeType: 'absolute', state: { x: 0, y: 0, zoom: 1 }, duration: 300 });
    fixture.detectChanges();
    await pause(100);
    dispatchPointer(pane, 'pointerdown', { x: 100 });
    const interrupted = flow.viewport();
    await pause(300);
    expect(flow.viewport()).toEqual(interrupted);
    dispatchPointer(window, 'pointerup', { x: 100 });
  });

  it('reports the pressed element as the target of a pane click', () => {
    const selection = fixture.debugElement.injector.get(SelectionService);
    const setViewport = spyOn(selection, 'setViewport').and.callThrough();
    const child = document.createElement('span');
    pane.appendChild(child);
    dispatchPointer(child, 'pointerdown', { x: 100 });
    dispatchPointer(window, 'pointermove', { x: 101 });
    dispatchPointer(window, 'pointerup', { x: 101 });
    expect(setViewport).toHaveBeenCalledOnceWith(jasmine.objectContaining({ target: child }));
  });

  it('suppresses the click after a pan and keeps a plain click', async () => {
    let clicks = 0;
    pane.addEventListener('click', () => clicks++);
    drag();
    pane.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(clicks).toBe(0);
    await pause(0);
    pointerDrag(pane, { x: 100 }, []);
    pane.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(clicks).toBe(1);
  });
});
