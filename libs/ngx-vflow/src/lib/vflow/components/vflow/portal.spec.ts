import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { Point } from '../../interfaces/point.interface';
import { PortalLayer } from '../../services/portal.service';
import { injectNode } from '../../utils/inject-node';
import { pointerDrag } from '../../gestures/pointer-events.testing';
import { VflowComponent } from './vflow.component';

/** A node component that declares content outside its own box. */
@Component({
  template: `<div style="width: 100px; height: 50px">
    <span *vPortal="{ x: ctx.node.point().x, y: ctx.node.point().y - 30 }" class="caption"
      >{{ ctx.node.id }} caption</span
    >
  </div>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CaptionedNodeComponent {
  protected readonly ctx = injectNode();
}

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes()">
    <div *vNode style="width: 100px; height: 50px"></div>

    <div
      *vPortal="point(); layer: layer()"
      class="note"
      style="width: 60px; height: 40px"
      [style.pointer-events]="takesPointer() ? 'auto' : null">
      note
    </div>
    <div *vPortal class="origin" style="position: absolute; transform: translate(10px, 20px)">origin</div>
    @if (shown()) {
      <span *vPortal="{ x: 300, y: 200 }" class="optional">optional</span>
    }
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly nodes = signal(
    createNodes([
      { id: 'a', point: { x: 100, y: 100 } },
      { id: 'b', point: { x: 250, y: 100 }, component: CaptionedNodeComponent },
    ]),
  );
  readonly point = signal<Point | null | undefined>({ x: 120, y: 105 });
  readonly layer = signal<PortalLayer>('above');
  readonly takesPointer = signal(false);
  readonly shown = signal(true);
}

describe('vPortal', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let root: HTMLElement;

  const flowRect = () => root.querySelector('[data-v-root]')!.getBoundingClientRect();
  const offset = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left - flowRect().left, y: rect.top - flowRect().top };
  };
  const note = () => root.querySelector<HTMLElement>('.note');
  const node = (index: number) => root.querySelectorAll<HTMLElement>('[data-v-node]')[index];
  const center = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  const hit = (point: Point) => document.elementFromPoint(point.x, point.y);

  async function settle() {
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
    document.body.append(root);
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    root.remove();
  });

  it('renders the content at its flow point, and moves and scales it with the viewport', async () => {
    expect(offset(note()!)).toEqual({ x: 120, y: 105 });
    expect(note()!.getBoundingClientRect().width).toBeCloseTo(60, 1);

    await host.flow().setViewport({ x: 30, y: -10, zoom: 2 });
    await settle();

    expect(offset(note()!).x).toBeCloseTo(30 + 120 * 2, 1);
    expect(offset(note()!).y).toBeCloseTo(-10 + 105 * 2, 1);
    expect(note()!.getBoundingClientRect().width).toBeCloseTo(120, 1);
  });

  it('puts content without a point at the origin, where it places itself', () => {
    expect(offset(root.querySelector('.origin')!)).toEqual({ x: 10, y: 20 });
  });

  it('renders nothing without a point, follows a changed point and leaves with its declaration', async () => {
    host.point.set(null);
    await settle();
    expect(note()).toBeNull();

    host.point.set({ x: 0, y: 0 });
    await settle();
    expect(offset(note()!)).toEqual({ x: 0, y: 0 });

    host.point.set({ x: 40, y: 60 });
    await settle();
    expect(offset(note()!)).toEqual({ x: 40, y: 60 });

    expect(root.querySelector('.optional')).not.toBeNull();
    host.shown.set(false);
    await settle();
    expect(root.querySelector('.optional')).toBeNull();
  });

  it('renders content declared by a node component, closed over the node context', () => {
    const caption = root.querySelector('.caption')!;

    expect(caption.textContent).toBe('b caption');
    expect(offset(caption)).toEqual({ x: 250, y: 70 });
    // In the layer of the viewport, not in the node box.
    expect(caption.closest('[data-v-node]')).toBeNull();
    expect(caption.closest('[data-v-portal-layer="above"]')).not.toBeNull();
  });

  it('lets the pointer through to the node under it unless the content asks for the pointer', async () => {
    const overlap = { x: flowRect().left + 140, y: flowRect().top + 125 };

    expect(hit(overlap)?.closest('[data-v-node]')).toBe(node(0));

    host.takesPointer.set(true);
    await settle();
    expect(hit(overlap)).toBe(note());
  });

  it('paints the content above the nodes, or below them with the layer below', async () => {
    host.takesPointer.set(true);
    await settle();
    const overlap = { x: flowRect().left + 140, y: flowRect().top + 125 };
    expect(hit(overlap)).toBe(note());

    host.layer.set('below');
    await settle();
    expect(note()!.closest('[data-v-portal-layer="below"]')).not.toBeNull();
    expect(hit(overlap)?.closest('[data-v-node]')).toBe(node(0));

    // Outside the node the content below still takes the pointer: the pane is under it, not over it.
    host.point.set({ x: 0, y: 0 });
    await settle();
    expect(hit(center(note()!))).toBe(note());
  });

  it('is not part of the graph: the node bounds ignore it', async () => {
    host.point.set({ x: -500, y: -500 });
    await settle();

    expect(host.flow().getNodesBounds()).toEqual({ x: 100, y: 100, width: 250, height: 50 });
  });

  it('pans the viewport on a press on content that takes the pointer, and clears the selection on a click', async () => {
    host.takesPointer.set(true);
    host.point.set({ x: 0, y: 0 });
    await settle();
    host.nodes()[0].selected!.set(true);
    await settle();

    const start = center(note()!);
    pointerDrag(note()!, start, [{ x: start.x + 40, y: start.y }]);
    await settle();
    expect(host.flow().viewport().x).toBe(40);
    expect(host.nodes()[0].selected!()).toBe(true);

    const point = center(note()!);
    pointerDrag(note()!, point, []);
    await settle();
    expect(host.nodes()[0].selected!()).toBe(false);
  });
});
