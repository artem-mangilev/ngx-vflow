import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowMinimapComponent } from './minimap.component';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [view]="size()"
    [nodes]="nodes"
    [minZoom]="0.5"
    [maxZoom]="2"
    [panOnDrag]="panOnDrag()"
    [keyboardShortcuts]="keyboardShortcuts()"
    [zoomOnScroll]="zoomOnScroll()"
    [zoomOnPinch]="zoomOnPinch()"
    [panOnScroll]="panOnScroll()">
    @if (show()) {
      <v-minimap [pannable]="pannable()" [zoomable]="zoomable()" [zoomStep]="step()" />
    }
  </vflow>`,
})
class MinimapHostComponent {
  flow = viewChild.required(VflowComponent);
  panOnDrag = signal<boolean | number[]>(true);
  keyboardShortcuts = signal<KeyboardShortcuts>({});
  zoomOnScroll = signal(true);
  zoomOnPinch = signal(true);
  panOnScroll = signal(false);
  size = signal<[number, number]>([400, 300]);
  show = signal(true);
  pannable = signal(false);
  zoomable = signal(false);
  step = signal(0.1);
  nodes = createNodes([
    { id: 'parent', point: { x: 10000, y: -5000 }, width: 400, height: 300, selected: true },
    { id: 'child', parentId: 'parent', point: { x: 600, y: 200 }, width: 200, height: 200 },
    { id: 'grandchild', parentId: 'child', point: { x: 100, y: 100 }, width: 100, height: 100 },
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
    fixture = TestBed.createComponent(MinimapHostComponent);
    host = fixture.componentInstance;
    await settle();
    flow = host.flow();
    canvas = fixture.nativeElement.querySelector('canvas');
    // Synthetic pointer events cannot acquire native capture; real capture is covered by Playwright.
    vi.spyOn(canvas, 'setPointerCapture').mockImplementation(() => {});
    vi.spyOn(canvas, 'hasPointerCapture').mockReturnValue(true);
    vi.spyOn(canvas, 'releasePointerCapture').mockImplementation(() => {});
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
    expect(host.nodes[0].selected()).toBe(true);
  });

  it('centers clicks at non-unit zoom and after resizing without redrawing cached nodes on navigation', async () => {
    host.pannable.set(true);
    flow.setViewport({ x: 0, y: 0, zoom: 1.5 });
    await settle();
    const draw = vi.spyOn(CanvasRenderingContext2D.prototype, 'roundRect');
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
    host.panOnDrag.set([1]);
    host.keyboardShortcuts.set({ modifiers: { panActivation: ['Space'] } });
    await settle();
    await click();
    expect(flow.viewport().x).toBe(0);
    await click(40, 30, { button: 1 });
    expect(flow.viewport().x).toBe(-10200);
    host.panOnDrag.set(false);
    fixture.detectChanges();
    await click(50, 30, { pointerType: 'touch' });
    expect(flow.viewport().x).toBe(-10200);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await click(50, 30, { pointerType: 'touch' });
    expect(flow.viewport().x).toBe(-10300);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }));
    await click();
    expect(flow.viewport().x).toBe(-10300);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
    pointer('pointerdown', 50, 30, { pointerType: 'touch' });
    pointer('pointermove', 70, 30, { pointerType: 'touch' });
    pointer('pointerup', 70, 30, { pointerType: 'touch' });
    await settle();
    expect(flow.viewport().x).toBe(-10500);
  });

  it('zooms around the main center, clamps to limits, validates steps and respects wheel/pinch policy', async () => {
    host.zoomable.set(true);
    host.step.set(1);
    flow.setViewport({ x: -10200, y: 4950, zoom: 1 });
    await settle();
    expect((await wheel()).defaultPrevented).toBe(true);
    expect(flow.viewport()).toEqual({ x: -20600, y: 9750, zoom: 2 });
    await wheel();
    expect(flow.viewport().zoom).toBe(2);
    await wheel(10);
    await wheel(10);
    await wheel(10);
    expect(flow.viewport().zoom).toBe(0.5);
    host.zoomOnScroll.set(false);
    fixture.detectChanges();
    await wheel();
    expect(flow.viewport().zoom).toBe(0.5);
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBe(1);
    host.zoomOnPinch.set(false);
    fixture.detectChanges();
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBe(1);
    host.zoomOnScroll.set(true);
    fixture.detectChanges();
    for (const value of [0, -1, NaN, Infinity]) {
      host.step.set(value);
      flow.setViewport({ x: 0, y: 0, zoom: 1 });
      await settle();
      await wheel();
      expect(flow.viewport().zoom).toBeCloseTo(1.1);
    }
  });

  it('gives scroll pan priority and allows zoom activation without bypassing the minimap switches', async () => {
    host.pannable.set(true);
    host.zoomable.set(true);
    host.panOnScroll.set(true);
    host.keyboardShortcuts.set({ modifiers: { zoomActivation: ['KeyZ'] } });
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

  it('leaves the flow with its host and navigates again when shown back', async () => {
    host.pannable.set(true);
    host.zoomable.set(true);
    await settle();
    expect(fixture.nativeElement.querySelector('.v-minimap canvas')).toBe(canvas);
    host.show.set(false);
    await settle();
    expect(fixture.nativeElement.querySelector('.v-minimap')).toBeNull();
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
    // The detached canvas no longer owns wheel input.
    expect((await wheel()).defaultPrevented).toBe(false);
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    host.show.set(true);
    await settle();
    canvas = fixture.nativeElement.querySelector('.v-minimap canvas');
    expect(canvas).not.toBeNull();
    vi.spyOn(canvas, 'setPointerCapture').mockImplementation(() => {});
    await click();
    expect(flow.viewport()).toEqual({ x: -10200, y: 4950, zoom: 1 });
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(1.1);
  });
});

@Component({
  selector: 'app-minimap',
  imports: [VflowMinimapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<v-minimap />`,
})
class WrappedMinimapComponent {}

@Component({
  imports: [Vflow, WrappedMinimapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [view]="[400, 300]" [nodes]="[]">
    @if (projectAs()) {
      <app-minimap ngProjectAs="v-minimap" />
    } @else {
      <app-minimap />
    }
  </vflow>`,
})
class WrappedMinimapHostComponent {
  projectAs = signal(false);
}

describe('minimap projection', () => {
  async function render(projectAs: boolean) {
    const fixture = TestBed.createComponent(WrappedMinimapHostComponent);
    fixture.componentInstance.projectAs.set(projectAs);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('does not render a minimap that a wrapper hides from the flow slot', async () => {
    const root = await render(false);
    expect(root.querySelector('.v-root canvas')).toBeNull();
  });

  it('renders a wrapper marked with ngProjectAs', async () => {
    const root = await render(true);
    expect(root.querySelector('.v-root .v-minimap canvas')).not.toBeNull();
  });
});
