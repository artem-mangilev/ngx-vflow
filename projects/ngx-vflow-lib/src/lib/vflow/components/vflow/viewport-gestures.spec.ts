import { ChangeDetectionStrategy, Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { Vflow } from '../../vflow';

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
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    spyOnProperty(navigator, 'maxTouchPoints').and.returnValue(2);
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
    await pause(); // Let D3 finish its wheel/touch gesture before destroying the fixture.
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

  function mouse(target: EventTarget, type: string, x: number, button = 0) {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 100, button, view: window }),
    );
  }

  function drag(button = 0, target: Element = pane) {
    mouse(target, 'mousedown', 100, button);
    mouse(window, 'mousemove', 140, button);
    mouse(window, 'mouseup', 140, button);
  }

  function key(type: string, code: string, target: EventTarget = document) {
    target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, code }));
  }

  function touch(type: string, points: number[]) {
    const touches = points.map((clientX, identifier) => new Touch({ identifier, target: pane, clientX, clientY: 100 }));
    const event = new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches: touches });
    pane.dispatchEvent(event);
    return event;
  }

  it('preserves ordinary wheel zoom and all-button drag defaults', () => {
    drag(2);
    expect(flow.viewport().x).toBe(40);
    wheel();
    expect(flow.viewport().zoom).toBeGreaterThan(1);
  });

  it('gives scroll pan priority, with opt-in zoom and pan activation keys', () => {
    flow.panOnScroll = true;
    flow.keyboardShortcuts = { zoom: ['KeyZ'], pan: ['Space'] };
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
    flow.keyboardShortcuts = { pan: null, zoom: null };
    drag();
    expect(wheel().defaultPrevented).toBeFalse();
    expect(wheel(pane, true).defaultPrevented).toBeFalse();
    mouse(pane, 'dblclick', 100);
    touch('touchstart', [100, 150]);
    expect(touch('touchmove', [80, 170]).defaultPrevented).toBeFalse();
    touch('touchend', []);
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    flow.viewportTo({ x: 20, y: 30, zoom: 2 });
    fixture.detectChanges();
    await pause(50);
    expect(flow.viewport()).toEqual({ x: 20, y: 30, zoom: 2 });
    flow.panTo({ x: 40, y: 50 });
    fixture.detectChanges();
    await pause(50);
    expect(flow.viewport()).toEqual({ x: 40, y: 50, zoom: 2 });
    flow.zoomTo(1);
    fixture.detectChanges();
    await pause(50);
    expect(flow.viewport().zoom).toBe(1);
  });

  it('restricts mouse buttons and gives selection priority over pan activation', () => {
    flow.panOnDrag = [1];
    drag();
    expect(flow.viewport().x).toBe(0);
    drag(1);
    expect(flow.viewport().x).toBe(40);
    flow.keyboardShortcuts = { selection: ['Space'], pan: ['Space'] };
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
    flow.keyboardShortcuts = { zoom: ['ControlLeft'] };
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
    const node = createNode({ id: 'node', type: 'default', point: { x: 0, y: 0 } });
    fixture.componentRef.setInput('nodes', [node]);
    fixture.detectChanges();
    await fixture.whenStable();
    flow.keyboardShortcuts = { pan: ['Space'] };
    key('keydown', 'Space');
    drag(0, pane.querySelector('.vflow-node')!);
    expect(node.point()).toEqual({ x: 40, y: 0 });
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('leaves touch scrolling available in an opted-out draggable-node control', async () => {
    const { createNode } = await import('../../interfaces/node.interface');
    fixture.componentRef.setInput('nodes', [createNode({ id: 'node', type: 'default', point: { x: 0, y: 0 } })]);
    fixture.detectChanges();
    await fixture.whenStable();
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    const node = pane.querySelector('.vflow-node') as HTMLElement;
    node.appendChild(controls.nativeElement);
    expect(node.style.touchAction).not.toBe('none');
    const input = controls.nativeElement.querySelector('input');
    for (const type of ['touchstart', 'touchmove', 'touchend']) {
      const touches =
        type === 'touchend'
          ? []
          : [new Touch({ identifier: 0, target: input, clientX: 100, clientY: type === 'touchmove' ? 140 : 100 })];
      const event = new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches: touches });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBeFalse();
    }
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    controls.destroy();
  });

  it('keeps touchscreen pinch available inside a no-pan region', () => {
    const controls = TestBed.createComponent(ControlsComponent);
    controls.detectChanges();
    pane.appendChild(controls.nativeElement);
    const target = controls.nativeElement.querySelector('span');
    for (const [type, points] of [
      ['touchstart', [100, 200]],
      ['touchmove', [90, 230]],
    ] as const) {
      const touches = points.map((clientX, identifier) => new Touch({ identifier, target, clientX, clientY: 100 }));
      target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches: touches }));
    }
    expect(flow.viewport().zoom).toBeCloseTo(1.4);
    // Scale around the initial midpoint without the additional 10px pan.
    expect(flow.viewport().x).toBeCloseTo(-60);
    target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [] }));
    controls.destroy();
  });

  it('preserves page scrolling for a new outward wheel gesture at the zoom limit', async () => {
    flow.zoomTo(3);
    fixture.detectChanges();
    await pause(50);
    expect(wheel().defaultPrevented).toBeFalse();
    expect(flow.viewport().zoom).toBe(3);
  });

  it('uses the configured pane click tolerance to clear selection', async () => {
    const { createNode } = await import('../../interfaces/node.interface');
    const node = createNode({ id: 'node', type: 'default', point: { x: 200, y: 200 }, selected: true });
    fixture.componentRef.setInput('nodes', [node]);
    fixture.detectChanges();
    await fixture.whenStable();
    flow.paneClickDistance = 2;
    mouse(pane, 'mousedown', 100);
    mouse(pane, 'mousemove', 104);
    mouse(pane, 'mouseup', 104);
    expect(node.selected()).toBeTrue();
    flow.paneClickDistance = 6;
    mouse(pane, 'mousedown', 100);
    mouse(pane, 'mousemove', 104);
    mouse(pane, 'mouseup', 104);
    expect(node.selected()).toBeFalse();
  });

  it('allows touchscreen pinch with drag pan disabled', () => {
    flow.panOnDrag = false;
    touch('touchstart', [100, 200]);
    touch('touchmove', [80, 220]);
    expect(flow.viewport().zoom).toBeCloseTo(1.4);
    touch('touchend', []);
  });

  it('allows touchscreen pan while pinch zoom is disabled', () => {
    flow.zoomOnPinch = false;
    touch('touchstart', [100, 200]);
    touch('touchmove', [90, 230]);
    expect(flow.viewport().zoom).toBe(1);
    expect(flow.viewport().x).toBeCloseTo(10);
    touch('touchend', []);
  });

  it('toggles double-click zoom after initialization', async () => {
    mouse(pane, 'dblclick', 100);
    await pause(300);
    expect(flow.viewport().zoom).toBe(1);
    flow.zoomOnDoubleClick = true;
    mouse(pane, 'dblclick', 100);
    await pause(300);
    expect(flow.viewport().zoom).toBe(2);
  });
});
