import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { Node, StaticNode, createNodes } from '../../interfaces/node.interface';
import { Rect } from '../../interfaces/rect';
import { pointerDrag } from '../../gestures/pointer-events.testing';
import { ControlPosition, ResizeAxis } from './resizer-types';

interface Limits {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

@Component({
  template: `
    <vflow style="width: 500px; height: 400px" [nodes]="nodes()">
      <ng-template vNode>
        <div
          vResizable
          [style.min-width.px]="cssMinWidth()"
          [minWidth]="limits().minWidth"
          [minHeight]="limits().minHeight"
          [maxWidth]="limits().maxWidth"
          [maxHeight]="limits().maxHeight"
          [keepAspectRatio]="keepAspectRatio()"
          [resizeAxis]="resizeAxis()"></div>
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResizeHostComponent {
  public readonly flow = viewChild.required(VflowComponent);
  public readonly nodes = signal<Node[]>([]);
  public readonly limits = signal<Limits>({});
  public readonly cssMinWidth = signal<number | null>(null);
  public readonly keepAspectRatio = signal(false);
  public readonly resizeAxis = signal<ResizeAxis | undefined>(undefined);
}

interface Options {
  nodes?: StaticNode[];
  limits?: Limits;
  cssMinWidth?: number;
  keepAspectRatio?: boolean;
  resizeAxis?: ResizeAxis;
}

const SQUARE: StaticNode[] = [{ id: 'node', point: { x: 100, y: 100 }, width: 100, height: 100 }];
const WIDE: StaticNode[] = [{ id: 'node', point: { x: 100, y: 100 }, width: 200, height: 100 }];
/** A child of 60×40 at 150,110 in the flow, inside a parent of 200×150 at 50,50; extent `parent` is the default. */
const FAMILY: StaticNode[] = [
  { id: 'parent', point: { x: 50, y: 50 }, width: 200, height: 150 },
  { id: 'child', parentId: 'parent', point: { x: 100, y: 60 }, width: 60, height: 40 },
];

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

async function render(options: Options = {}) {
  const fixture = TestBed.createComponent(ResizeHostComponent);
  const host = fixture.componentInstance;
  host.nodes.set(createNodes(options.nodes ?? SQUARE));
  host.limits.set(options.limits ?? {});
  host.cssMinWidth.set(options.cssMinWidth ?? null);
  host.keepAspectRatio.set(options.keepAspectRatio ?? false);
  host.resizeAxis.set(options.resizeAxis);
  await settle(fixture);

  /** Drags a control of a node by `dx`, `dy` screen pixels, at zoom 1 also flow units, and returns its rect. */
  async function resize(id: string, position: ControlPosition, dx: number, dy: number) {
    const control = Array.from(
      fixture.nativeElement.querySelectorAll(`[data-v-resize-control-position="${position}"]`) as NodeListOf<Element>,
    ).find((element) => element.closest('[data-v-node]')!.getAttribute('data-v-node') === id)!;
    const rect = control.getBoundingClientRect();
    const from = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    pointerDrag(control, from, [
      { x: from.x + dx / 2, y: from.y + dy / 2 },
      { x: from.x + dx, y: from.y + dy },
    ]);
    await settle(fixture);
    return rounded(host.flow().getNodeRect(id)!);
  }

  return { fixture, host, resize };
}

function rounded({ x, y, width, height }: Rect) {
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(x), y: round(y), width: round(width), height: round(height) };
}

const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe('resize gesture', () => {
  it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
    ['right', 20, 0, rect(100, 100, 120, 100)],
    ['left', -20, 0, rect(80, 100, 120, 100)],
    ['left', 30, 0, rect(130, 100, 70, 100)],
    ['top', 0, -20, rect(100, 80, 100, 120)],
    ['bottom', 0, 20, rect(100, 100, 100, 120)],
    ['top-left', -20, -20, rect(80, 80, 120, 120)],
    ['top-right', 20, -20, rect(100, 80, 120, 120)],
    ['bottom-left', -20, 20, rect(80, 100, 120, 120)],
    ['bottom-right', 20, 20, rect(100, 100, 120, 120)],
  ])('resizes from the %s control dragged by %i, %i', async (position, dx, dy, expected) => {
    const { resize } = await render();

    expect(await resize('node', position, dx, dy)).toEqual(expected);
  });

  it('writes the moved point of a node resized from its top left corner to the application', async () => {
    const { host, resize } = await render();

    await resize('node', 'top-left', -20, -30);

    expect(host.nodes()[0].point()).toEqual({ x: 80, y: 70 });
  });

  it.each<[string, Limits, ControlPosition, number, number, ReturnType<typeof rect>]>([
    ['minWidth', { minWidth: 80 }, 'right', -50, 0, rect(100, 100, 80, 100)],
    ['minWidth from the left', { minWidth: 80 }, 'left', 50, 0, rect(120, 100, 80, 100)],
    ['maxWidth', { maxWidth: 150 }, 'right', 100, 0, rect(100, 100, 150, 100)],
    ['minHeight', { minHeight: 60 }, 'bottom', 0, -80, rect(100, 100, 100, 60)],
    ['maxHeight', { maxHeight: 120 }, 'bottom', 0, 50, rect(100, 100, 100, 120)],
    ['maxHeight from the top', { maxHeight: 120 }, 'top', 0, -50, rect(100, 80, 100, 120)],
  ])('stops the drag at %s', async (_, limits, position, dx, dy, expected) => {
    const { resize } = await render({ limits });

    expect(await resize('node', position, dx, dy)).toEqual(expected);
  });

  it('grows a node that starts below its CSS min width from the min width instead of shrinking it', async () => {
    const { resize } = await render({
      nodes: [{ id: 'node', point: { x: 100, y: 100 }, width: 100, height: 50 }],
      cssMinWidth: 240,
    });

    expect(await resize('node', 'right', 40, 0)).toEqual(rect(100, 100, 280, 50));
  });

  it.each<[ResizeAxis, ControlPosition, number, number, ReturnType<typeof rect>]>([
    ['horizontal', 'bottom-right', 20, 20, rect(100, 100, 120, 100)],
    ['vertical', 'bottom-right', 20, 20, rect(100, 100, 100, 120)],
    ['horizontal', 'top-left', -20, -20, rect(80, 100, 120, 100)],
    ['horizontal', 'top', 0, -20, rect(100, 100, 100, 100)],
  ])('resizes only the %s axis from the %s control', async (resizeAxis, position, dx, dy, expected) => {
    const { resize } = await render({ resizeAxis });

    expect(await resize('node', position, dx, dy)).toEqual(expected);
  });

  it('keeps the other axis of a restricted resize even with keepAspectRatio', async () => {
    const { resize } = await render({ resizeAxis: 'horizontal', keepAspectRatio: true });

    expect(await resize('node', 'right', 20, 0)).toEqual(rect(100, 100, 120, 100));
  });

  describe('keepAspectRatio', () => {
    it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
      ['right', 40, 0, rect(100, 100, 240, 120)],
      ['bottom', 0, 20, rect(100, 100, 240, 120)],
      ['left', -40, 0, rect(60, 80, 240, 120)],
      ['bottom-right', 40, 0, rect(100, 100, 240, 120)],
      ['top-left', -40, -40, rect(20, 60, 280, 140)],
      ['top-right', 40, -40, rect(100, 60, 280, 140)],
    ])('keeps the 2:1 ratio of a node resized from the %s control', async (position, dx, dy, expected) => {
      const { resize } = await render({ nodes: WIDE, keepAspectRatio: true });

      expect(await resize('node', position, dx, dy)).toEqual(expected);
    });

    it.each<[string, Limits, ControlPosition, number, number]>([
      ['maxHeight', { maxHeight: 120 }, 'right', 100, 0],
      ['maxWidth', { maxWidth: 240 }, 'bottom', 0, 50],
    ])('stops both axes when %s stops the other axis', async (_, limits, position, dx, dy) => {
      const { resize } = await render({ nodes: WIDE, keepAspectRatio: true, limits });

      expect(await resize('node', position, dx, dy)).toEqual(rect(100, 100, 240, 120));
    });

    it.each([
      { size: '0×0', width: 0, height: 0, expected: rect(100, 100, 40, 40) },
      { size: '50×0', width: 50, height: 0, expected: rect(100, 100, 90, 40) },
      { size: '0×50', width: 0, height: 50, expected: rect(100, 100, 30, 80) },
    ])('resizes a $size node as a square without writing NaN', async ({ width, height, expected }) => {
      const { resize } = await render({
        nodes: [{ id: 'node', point: { x: 100, y: 100 }, width, height }],
        keepAspectRatio: true,
      });

      expect(await resize('node', 'bottom-right', 40, 30)).toEqual(expected);
    });
  });

  describe('a parent and a child with extent parent', () => {
    it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
      ['right', -150, 0, rect(50, 50, 160, 150)],
      ['left', 150, 0, rect(150, 50, 100, 150)],
      ['top', 0, 200, rect(50, 110, 200, 90)],
      ['bottom', 0, -200, rect(50, 50, 200, 100)],
    ])('stops the %s side of the parent at its child', async (position, dx, dy, expected) => {
      const { resize } = await render({ nodes: FAMILY });

      expect(await resize('parent', position, dx, dy)).toEqual(expected);
    });

    it('keeps the child in place in the flow when the left side of the parent moves', async () => {
      const { host, resize } = await render({ nodes: FAMILY });

      await resize('parent', 'left', 100, 0);

      expect(rounded(host.flow().getNodeRect('child')!)).toEqual(rect(150, 110, 60, 40));
      expect(host.nodes()[1].point()).toEqual({ x: 0, y: 60 });
    });

    it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
      ['bottom-right', 200, 200, rect(150, 110, 100, 90)],
      ['left', -200, 0, rect(50, 110, 160, 40)],
      ['top', 0, -200, rect(150, 50, 60, 100)],
    ])('stops the %s side of the child at the parent', async (position, dx, dy, expected) => {
      const { resize } = await render({ nodes: FAMILY });

      expect(await resize('child', position, dx, dy)).toEqual(expected);
    });

    it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
      ['right', -150, 0, rect(50, 50, 160, 120)],
      ['bottom', 0, -200, rect(50, 50, 160, 120)],
      ['left', 150, 0, rect(130, 110, 120, 90)],
      ['top', 0, 200, rect(130, 110, 120, 90)],
    ])('keeps the ratio of a parent stopped at its child from the %s control', async (position, dx, dy, expected) => {
      const { resize } = await render({ nodes: FAMILY, keepAspectRatio: true });

      expect(await resize('parent', position, dx, dy)).toEqual(expected);
    });

    // The height of 66.67 is rendered and measured as 67.
    it.each<[ControlPosition, number, number, ReturnType<typeof rect>]>([
      ['right', 200, 0, rect(150, 110, 100, 67)],
      ['bottom', 0, 200, rect(150, 110, 100, 67)],
      ['left', -200, 0, rect(60, 50, 150, 100)],
      ['top', 0, -200, rect(60, 50, 150, 100)],
      ['top-left', -200, -200, rect(60, 50, 150, 100)],
      ['bottom-left', -200, 200, rect(75, 110, 135, 90)],
    ])('keeps the ratio of a child stopped at the parent from the %s control', async (position, dx, dy, expected) => {
      const { resize } = await render({ nodes: FAMILY, keepAspectRatio: true });

      expect(await resize('child', position, dx, dy)).toEqual(expected);
    });
  });
});
