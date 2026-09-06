import {
  ChangeDetectionStrategy,
  Component,
  provideExperimentalZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [view]="size()" [nodes]="nodes" [minZoom]="0.5" [maxZoom]="2">
    <mini-map [pannable]="pannable()" [zoomable]="zoomable()" [zoomStep]="step()" />
  </vflow>`,
})
class MinimapHostComponent {
  flow = viewChild.required(VflowComponent);
  size = signal<[number, number]>([400, 300]);
  pannable = signal(false);
  zoomable = signal(false);
  step = signal(0.1);
  nodes = createNodes([
    { id: 'parent', type: 'default-group', point: { x: 10000, y: -5000 }, width: 400, height: 300, selected: true },
    { id: 'child', type: 'default-group', parentId: 'parent', point: { x: 600, y: 200 }, width: 200, height: 200 },
    { id: 'grandchild', type: 'default-group', parentId: 'child', point: { x: 100, y: 100 }, width: 100, height: 100 },
  ]);
}

describe('minimap navigation through the public viewport API', () => {
  let fixture: ComponentFixture<MinimapHostComponent>;
  let host: MinimapHostComponent;
  let flow: VflowComponent;
  let canvas: HTMLCanvasElement;

  async function settle() {
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    fixture = TestBed.createComponent(MinimapHostComponent);
    host = fixture.componentInstance;
    await settle();
    flow = host.flow();
    canvas = fixture.nativeElement.querySelector('canvas');
    // Synthetic pointer events cannot acquire native capture; real capture is covered by Playwright.
    spyOn(canvas, 'setPointerCapture');
    spyOn(canvas, 'hasPointerCapture').and.returnValue(true);
    spyOn(canvas, 'releasePointerCapture');
  });

  afterEach(() => window.dispatchEvent(new Event('blur')));

  function pointer(type: string, x: number, y: number, options: PointerEventInit = {}) {
    const rect = canvas.getBoundingClientRect();
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse',
      button: 0,
      clientX: rect.left + x,
      clientY: rect.top + y,
      ...options,
    });
    canvas.dispatchEvent(event);
    return event;
  }

  async function click(x = 40, y = 30, options: PointerEventInit = {}) {
    pointer('pointerdown', x, y, options);
    pointer('pointerup', x, y, options);
    await settle();
  }

  async function wheel(deltaY = -10, options: WheelEventInit = {}) {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY, ...options });
    canvas.dispatchEvent(event);
    await settle();
    return event;
  }

  it('retains the read-only default and enables only the canvas rectangle', async () => {
    expect(getComputedStyle(canvas).pointerEvents).toBe('none');
    await click();
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    host.pannable.set(true);
    await settle();
    expect(getComputedStyle(canvas).pointerEvents).toBe('auto');
    expect(getComputedStyle(canvas.parentElement!).pointerEvents).toBe('none');
    await click();
    // Nested group bounds are [10000,-5000,800,400], not child-local coordinates.
    expect(flow.viewport()).toEqual({ x: -10200, y: 4950, zoom: 1 });
    expect(host.nodes[0].selected()).toBeTrue();
  });

  it('centers clicks at non-unit zoom and after resizing without redrawing cached nodes on navigation', async () => {
    host.pannable.set(true);
    flow.viewportTo({ x: 0, y: 0, zoom: 1.5 });
    await settle();
    const draw = spyOn(CanvasRenderingContext2D.prototype, 'roundRect').and.callThrough();
    await click(60, 40);
    expect(flow.viewport()).toEqual({ x: -15700, y: 7200, zoom: 1.5 });
    expect(draw).not.toHaveBeenCalled();
    host.size.set([800, 600]);
    await settle();
    await click(80, 60);
    expect(flow.viewport()).toEqual({ x: -15200, y: 7500, zoom: 1.5 });
  });

  it('preserves the grab offset, captures drags outside the canvas and cancels without a click', async () => {
    host.pannable.set(true);
    await settle();
    await click();
    pointer('pointerdown', 35, 30);
    await settle();
    expect(flow.viewport().x).toBe(-10200);
    pointer('pointermove', 38, 30);
    await settle();
    expect(flow.viewport().x).toBe(-10200);
    pointer('pointermove', 95, 30);
    await settle();
    expect(flow.viewport().x).toBe(-10800);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    pointer('pointercancel', 95, 30);
    pointer('pointerup', 40, 30);
    await settle();
    expect(flow.viewport().x).toBe(-10800);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    pointer('pointerdown', 40, 30);
    host.pannable.set(false);
    await settle();
    const before = flow.viewport();
    pointer('pointermove', 60, 30);
    await settle();
    expect(flow.viewport()).toEqual(before);
  });

  it('gates pan by buttons, selection and activation keys, and supports single-pointer touch', async () => {
    host.pannable.set(true);
    flow.panOnDrag = [1];
    flow.keyboardShortcuts = { pan: ['Space'] };
    await settle();
    await click();
    expect(flow.viewport().x).toBe(0);
    await click(40, 30, { button: 1 });
    expect(flow.viewport().x).toBe(-10200);
    flow.panOnDrag = false;
    await click(50, 30, { pointerType: 'touch' });
    expect(flow.viewport().x).toBe(-10200);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await click(50, 30, { pointerType: 'touch' });
    expect(flow.viewport().x).toBe(-10300);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
    await click();
    expect(flow.viewport().x).toBe(-10300);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));
    pointer('pointerdown', 50, 30, { pointerType: 'touch' });
    pointer('pointermove', 70, 30, { pointerType: 'touch' });
    pointer('pointerup', 70, 30, { pointerType: 'touch' });
    await settle();
    expect(flow.viewport().x).toBe(-10500);
  });

  it('zooms around the main center, clamps to limits, validates steps and respects wheel/pinch policy', async () => {
    host.zoomable.set(true);
    host.step.set(1);
    flow.viewportTo({ x: -10200, y: 4950, zoom: 1 });
    await settle();
    expect((await wheel()).defaultPrevented).toBeTrue();
    expect(flow.viewport()).toEqual({ x: -20600, y: 9750, zoom: 2 });
    await wheel();
    expect(flow.viewport().zoom).toBe(2);
    await wheel(10);
    await wheel(10);
    await wheel(10);
    expect(flow.viewport().zoom).toBe(0.5);
    flow.zoomOnScroll = false;
    await wheel();
    expect(flow.viewport().zoom).toBe(0.5);
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBe(1);
    flow.zoomOnPinch = false;
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBe(1);
    flow.zoomOnScroll = true;
    for (const value of [0, -1, NaN, Infinity]) {
      host.step.set(value);
      flow.viewportTo({ x: 0, y: 0, zoom: 1 });
      await settle();
      await wheel();
      expect(flow.viewport().zoom).toBeCloseTo(1.1);
    }
  });

  it('gives scroll pan priority and allows zoom activation without bypassing the minimap switches', async () => {
    host.pannable.set(true);
    host.zoomable.set(true);
    flow.panOnScroll = true;
    flow.keyboardShortcuts = { zoom: ['KeyZ'] };
    await settle();
    await wheel(10, { deltaX: 5 });
    expect(flow.viewport()).toEqual({ x: -50, y: -100, zoom: 1 });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ' }));
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(1.1);
    host.zoomable.set(false);
    await settle();
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(1.1);
  });
});
