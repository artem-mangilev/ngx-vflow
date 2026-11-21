import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowMinimapComponent } from './minimap.component';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';
import { provideVflow } from '../../features/feature';
import { withShortcuts } from '../../features/with-shortcuts';
import { ZOOM_STEP } from '../../services/viewport.service';

/** Flow-space bounds of the nodes of the host below: nested group bounds, not child-local coordinates. */
const NODES = { x: 10000, y: -5000, width: 800, height: 400 };

/** Gap between the content of the minimap and its edges, in CSS pixels. */
const PADDING = 5;

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideVflow(withShortcuts(() => inject(MinimapHostComponent).keyboardShortcuts))],
  template: `<vflow
    [style.width.px]="size()[0]"
    [style.height.px]="size()[1]"
    [nodes]="nodes"
    [minZoom]="0.5"
    [maxZoom]="2"
    [panOnDrag]="panOnDrag()"
    [zoomOnScroll]="zoomOnScroll()"
    [zoomOnPinch]="zoomOnPinch()"
    [panOnScroll]="panOnScroll()">
    @if (show()) {
      <v-minimap vPanel="bottom-right" [pannable]="pannable()" [zoomable]="zoomable()" />
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
  let minimap: HTMLElement;
  let svg: SVGSVGElement;

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
    find();
    // Synthetic pointer events cannot acquire native capture; real capture is covered by Playwright.
    vi.spyOn(minimap, 'setPointerCapture').mockImplementation(() => {});
    vi.spyOn(minimap, 'hasPointerCapture').mockReturnValue(true);
    vi.spyOn(minimap, 'releasePointerCapture').mockImplementation(() => {});
  });

  afterEach(() => window.dispatchEvent(new Event('blur')));

  function find() {
    minimap = fixture.nativeElement.querySelector('v-minimap');
    svg = minimap?.querySelector('svg') as SVGSVGElement;
  }

  /** The visible flow area, from the viewport of the flow and the size of the host. */
  function view() {
    const { x, y, zoom } = flow.viewport();
    const [width, height] = host.size();
    return { x: -x / zoom, y: -y / zoom, width: width / zoom, height: height / zoom };
  }

  /** Flow space to CSS pixels of the drawing, derived here from the nodes united with the viewport, not read from the directive. */
  function transform() {
    const { width, height } = svg.getBoundingClientRect();
    const visible = view();
    const left = Math.min(NODES.x, visible.x);
    const top = Math.min(NODES.y, visible.y);
    const right = Math.max(NODES.x + NODES.width, visible.x + visible.width);
    const bottom = Math.max(NODES.y + NODES.height, visible.y + visible.height);
    const zoom = Math.min((width - PADDING * 2) / (right - left), (height - PADDING * 2) / (bottom - top));
    return { x: width / 2 - ((left + right) / 2) * zoom, y: height / 2 - ((top + bottom) / 2) * zoom, zoom };
  }

  /** The viewport that centers the flow on the flow point under a point of the minimap. */
  function centeredOn(x: number, y: number) {
    const map = transform();
    const [width, height] = host.size();
    const zoom = flow.viewport().zoom;
    return {
      x: width / 2 - ((x - map.x) / map.zoom) * zoom,
      y: height / 2 - ((y - map.y) / map.zoom) * zoom,
      zoom,
    };
  }

  /** Where the middle of the viewport is on the minimap: a press there is a press on the viewport. */
  function viewportOnCanvas(): [number, number] {
    const map = transform();
    const visible = view();
    return [map.x + (visible.x + visible.width / 2) * map.zoom, map.y + (visible.y + visible.height / 2) * map.zoom];
  }

  function expectViewport(expected: { x: number; y: number; zoom: number }) {
    expect(flow.viewport().x).toBeCloseTo(expected.x, 4);
    expect(flow.viewport().y).toBeCloseTo(expected.y, 4);
    expect(flow.viewport().zoom).toBeCloseTo(expected.zoom, 6);
  }

  /** The part of the drawing the mask leaves open, in CSS pixels: the viewport as the minimap marks it. */
  function hole() {
    const box = svg.getBoundingClientRect();
    const marked = minimap.querySelector('.v-minimap-viewport')!.getBoundingClientRect();
    return { x: marked.x - box.x, y: marked.y - box.y, width: marked.width, height: marked.height };
  }

  function pointer(type: string, x: number, y: number, options: PointerEventInit = {}) {
    const rect = svg.getBoundingClientRect();
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse',
      button: 0,
      // A mouse move without a pressed button ends a drag: the release happened where the page could not see it.
      buttons: type === 'pointerdown' || type === 'pointermove' ? 1 : 0,
      clientX: rect.left + x,
      clientY: rect.top + y,
      ...options,
    });
    svg.dispatchEvent(event);
    return event;
  }

  /** A press and a release in place, and the click the browser makes of them: `auxclick` for another button. */
  async function click(x = 40, y = 30, options: PointerEventInit = {}) {
    pointer('pointerdown', x, y, options);
    pointer('pointerup', x, y, options);
    pointer(options.button ? 'auxclick' : 'click', x, y, options);
    await settle();
  }

  async function wheel(deltaY = -10, options: WheelEventInit = {}) {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY, ...options });
    svg.dispatchEvent(event);
    await settle();
    return event;
  }

  it('is a block sized by CSS, with a drawing that fills it', () => {
    const block = minimap.getBoundingClientRect();
    const root = fixture.nativeElement.querySelector('[data-v-root]').getBoundingClientRect();

    // clamp(120px, 20%, 240px) of a 400px flow, 4:3; placed by vPanel with the default offset.
    expect([block.width, block.height]).toEqual([120, 90]);
    expect([root.right - block.right, root.bottom - block.bottom]).toEqual([10, 10]);
    expect([svg.getBoundingClientRect().width, svg.getBoundingClientRect().height]).toEqual([120, 90]);
    expect(getComputedStyle(minimap).borderTopWidth).toBe('0px');
  });

  it('retains the read-only default and lets the pointer through to the pane', async () => {
    expect(getComputedStyle(svg).pointerEvents).toBe('none');
    expect(getComputedStyle(minimap).pointerEvents).toBe('none');
    await click();
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    host.pannable.set(true);
    await settle();
    expect(getComputedStyle(svg).pointerEvents).toBe('auto');
    const expected = centeredOn(40, 30);
    await click();
    expectViewport(expected);
    expect(host.nodes[0].selected()).toBe(true);
  });

  it('keeps the viewport inside the minimap wherever the camera is', async () => {
    const [width, height] = [120, 90];
    for (const viewport of [
      { x: 0, y: 0, zoom: 1 },
      // Far from the nodes on every side, zoomed in and out.
      { x: 60000, y: -40000, zoom: 2 },
      { x: -90000, y: 70000, zoom: 0.5 },
      // On the nodes at the largest zoom: the viewport is a small part of the graph.
      { x: -10300 * 2 + 200, y: 4800 * 2 + 150, zoom: 2 },
    ]) {
      flow.setViewport(viewport);
      await settle();
      const map = transform();
      const visible = view();
      const marked = hole();

      expect(marked.x).toBeGreaterThanOrEqual(0);
      expect(marked.y).toBeGreaterThanOrEqual(0);
      expect(marked.x + marked.width).toBeLessThanOrEqual(width);
      expect(marked.y + marked.height).toBeLessThanOrEqual(height);
      // The mask is cut on device pixels, so the edges are within a pixel of the exact rectangle.
      const expected = {
        width: Math.max(8, visible.width * map.zoom),
        height: Math.max(8, visible.height * map.zoom),
      };
      const center = viewportOnCanvas();
      expect(Math.abs(marked.x + marked.width / 2 - center[0])).toBeLessThan(1);
      expect(Math.abs(marked.y + marked.height / 2 - center[1])).toBeLessThan(1);
      expect(Math.abs(marked.width - expected.width)).toBeLessThan(2);
      expect(Math.abs(marked.height - expected.height)).toBeLessThan(2);
    }
  });

  it('marks a viewport that is tiny against the graph with a rectangle large enough to find', async () => {
    // So far from the nodes that the viewport is a hundredth of a pixel of the minimap.
    flow.setViewport({ x: 4_000_000, y: -3_000_000, zoom: 2 });
    await settle();
    expect(view().width * transform().zoom).toBeLessThan(0.1);

    const marked = hole();
    expect(marked.width).toBeGreaterThanOrEqual(7);
    expect(marked.height).toBeGreaterThanOrEqual(7);
    const center = viewportOnCanvas();
    expect(Math.abs(marked.x + marked.width / 2 - center[0])).toBeLessThan(1);
    expect(Math.abs(marked.y + marked.height / 2 - center[1])).toBeLessThan(1);
  });

  it('centers clicks at non-unit zoom and after resizing without building the node paths again on navigation', async () => {
    host.pannable.set(true);
    flow.setViewport({ x: 0, y: 0, zoom: 1.5 });
    await settle();
    const paths = () => Array.from(svg.querySelectorAll('path'), (path) => path.getAttribute('d'));
    const built = paths();
    let expected = centeredOn(60, 40);
    await click(60, 40);
    expectViewport(expected);
    for (let i = 0; i < 5; i++) {
      flow.setViewport({ ...flow.viewport(), x: flow.viewport().x - 400 });
      await settle();
    }
    // The paths are in flow space: the camera changes how they are painted, not what they are.
    expect(paths()).toEqual(built);

    host.size.set([800, 600]);
    await settle();
    expect(svg.getBoundingClientRect().width).toBe(160);
    expect(paths()).toEqual(built);
    expected = centeredOn(80, 60);
    await click(80, 60);
    expectViewport(expected);
  });

  it('drags the viewport by the pointer movement, captures drags outside the minimap and cancels without a click', async () => {
    host.pannable.set(true);
    await settle();
    await click(100, 20);
    const start = flow.viewport();
    const zoom = transform().zoom;
    const [x, y] = viewportOnCanvas();
    pointer('pointerdown', x, y);
    await settle();
    expectViewport(start);
    // Within the click distance of the flow nothing moves.
    pointer('pointermove', x + 3, y);
    await settle();
    expectViewport(start);
    // Beyond it the viewport follows the whole movement since the press, also outside the minimap.
    pointer('pointermove', x - 30, y - 100);
    await settle();
    expectViewport({ x: start.x + 30 / zoom, y: start.y + 100 / zoom, zoom: 1 });
    expect(minimap.setPointerCapture).toHaveBeenCalledWith(1);
    const dragged = flow.viewport();
    pointer('pointercancel', x - 30, y - 100);
    pointer('pointerup', x, y);
    await settle();
    expect(flow.viewport()).toEqual(dragged);
    expect(minimap.releasePointerCapture).toHaveBeenCalledWith(1);
    pointer('pointerdown', 40, 30);
    host.pannable.set(false);
    await settle();
    const before = flow.viewport();
    pointer('pointermove', 80, 30);
    await settle();
    expect(flow.viewport()).toEqual(before);
  });

  it('gates pan by buttons, selection and activation keys, and supports single-pointer touch', async () => {
    host.pannable.set(true);
    host.panOnDrag.set([1]);
    host.keyboardShortcuts.set({ modifiers: { panActivation: ['Space'] } });
    await settle();
    await click(100, 20);
    expect(flow.viewport().x).toBe(0);
    let expected = centeredOn(100, 20);
    await click(100, 20, { button: 1 });
    expectViewport(expected);
    host.panOnDrag.set(false);
    fixture.detectChanges();
    const gated = flow.viewport();
    await click(60, 30, { pointerType: 'touch' });
    expect(flow.viewport()).toEqual(gated);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expected = centeredOn(60, 30);
    await click(60, 30, { pointerType: 'touch' });
    expectViewport(expected);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }));
    const selecting = flow.viewport();
    await click(100, 20);
    expect(flow.viewport()).toEqual(selecting);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
    // A touch that presses the viewport and moves drags it.
    const zoom = transform().zoom;
    const [x, y] = viewportOnCanvas();
    pointer('pointerdown', x, y, { pointerType: 'touch' });
    pointer('pointermove', x + 20, y, { pointerType: 'touch' });
    pointer('pointerup', x + 20, y, { pointerType: 'touch' });
    await settle();
    expectViewport({ x: selecting.x - 20 / zoom, y: selecting.y, zoom: 1 });
  });

  it('zooms around the main center by half a key step, clamps to limits and respects wheel/pinch policy', async () => {
    const step = Math.sqrt(ZOOM_STEP);
    host.zoomable.set(true);
    flow.setViewport({ x: -10200, y: 4950, zoom: 1 });
    await settle();
    expect((await wheel()).defaultPrevented).toBe(true);
    expect(flow.viewport().zoom).toBeCloseTo(step);
    for (let i = 0; i < 10; i++) await wheel();
    expect(flow.viewport().zoom).toBe(2);
    expect(flow.viewport().x).toBeCloseTo(-20600);
    expect(flow.viewport().y).toBeCloseTo(9750);
    for (let i = 0; i < 20; i++) await wheel(10);
    expect(flow.viewport().zoom).toBe(0.5);
    host.zoomOnScroll.set(false);
    fixture.detectChanges();
    await wheel();
    expect(flow.viewport().zoom).toBe(0.5);
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBeCloseTo(0.5 * step);
    host.zoomOnPinch.set(false);
    fixture.detectChanges();
    await wheel(-10, { ctrlKey: true });
    expect(flow.viewport().zoom).toBeCloseTo(0.5 * step);
  });

  it('gives scroll pan priority and allows zoom activation without bypassing the minimap switches', async () => {
    host.pannable.set(true);
    host.zoomable.set(true);
    host.panOnScroll.set(true);
    host.keyboardShortcuts.set({ modifiers: { zoomActivation: ['KeyZ'] } });
    await settle();
    const zoom = transform().zoom;
    await wheel(10, { deltaX: 5 });
    expectViewport({ x: -5 / zoom, y: -10 / zoom, zoom: 1 });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ' }));
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(Math.sqrt(ZOOM_STEP));
    host.zoomable.set(false);
    await settle();
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(Math.sqrt(ZOOM_STEP));
  });

  it('leaves the flow with its host and navigates again when shown back', async () => {
    host.pannable.set(true);
    host.zoomable.set(true);
    await settle();
    expect(fixture.nativeElement.querySelector('.v-minimap svg')).toBe(svg);
    host.show.set(false);
    await settle();
    expect(fixture.nativeElement.querySelector('.v-minimap')).toBeNull();
    // The detached minimap no longer owns wheel input.
    expect((await wheel()).defaultPrevented).toBe(false);
    expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    host.show.set(true);
    await settle();
    find();
    expect(svg).not.toBeNull();
    const expected = centeredOn(100, 20);
    await click(100, 20);
    expectViewport(expected);
    await wheel();
    expect(flow.viewport().zoom).toBeCloseTo(Math.sqrt(ZOOM_STEP));
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
  styles: `
    .map {
      inset: 20px auto auto 30px;
      width: 200px;
      height: 100px;
      border: 2px solid rgb(255, 0, 0);
      border-radius: 8px;
      background: rgb(0, 0, 255);
    }
  `,
  template: `<vflow style="width: 400px; height: 300px" [nodes]="[]">
    @if (wrapped()) {
      <app-minimap />
    } @else {
      <v-minimap class="map" vPanel="bottom-right" />
    }
  </vflow>`,
})
class StyledMinimapHostComponent {
  wrapped = signal(false);
}

describe('minimap block', () => {
  async function render(wrapped: boolean) {
    const fixture = TestBed.createComponent(StyledMinimapHostComponent);
    fixture.componentInstance.wrapped.set(wrapped);
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a minimap inside a wrapper with the rest of the flow content, above the pane', async () => {
    const root = await render(true);
    expect(root.querySelector('[data-v-root] .v-content-layer .v-minimap svg')).not.toBeNull();
  });

  it('takes its size, frame, background and place from the styles of the application', async () => {
    const root = await render(false);
    const flow = root.querySelector('[data-v-root]')!.getBoundingClientRect();
    const minimap = root.querySelector<HTMLElement>('v-minimap')!;
    const svg = minimap.querySelector('svg')!;
    const rect = minimap.getBoundingClientRect();
    const style = getComputedStyle(minimap);

    expect([rect.width, rect.height]).toEqual([200, 100]);
    // The class of the application moves the panel: its inset wins over the corner, the default offset stays.
    expect([rect.left - flow.left, rect.top - flow.top]).toEqual([40, 30]);
    expect(style.borderTopWidth).toBe('2px');
    expect(style.borderTopLeftRadius).toBe('8px');
    expect(style.backgroundColor).toBe('rgb(0, 0, 255)');
    // The drawing fills the content box and paints no background of its own.
    expect([svg.getBoundingClientRect().width, svg.getBoundingClientRect().height]).toEqual([196, 96]);
    expect(getComputedStyle(svg).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});
