import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Node, createNodes } from '../../interfaces/node.interface';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { Vflow } from '../../vflow';
import { dispatchPointer, pointerDrag } from '../../gestures/pointer-events.testing';
import { ControlPosition, ResizeEvent } from './resizer-types';

@Component({
  template: `
    <vflow style="width: 400px; height: 300px" [nodes]="nodes">
      <ng-template vNode>
        @if (useCustomGap()) {
          <div class="box" [vResizable]="enabled()" [gap]="4" [autoScale]="autoScale()"></div>
        } @else {
          <div class="box" [vResizable]="enabled()" [autoScale]="autoScale()"></div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 400px;
      height: 300px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResizableTestHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly useCustomGap = signal(true);
  public readonly enabled = signal(true);
  public readonly autoScale = signal(true);
  public readonly nodes = createNodes([{ id: 'node', point: { x: 50, y: 50 }, width: 100, height: 80 }]);
}

@Component({
  template: `
    <vflow style="width: 400px; height: 300px" [nodes]="nodes()">
      <ng-template vNode>
        @if (withResizable()) {
          <div
            class="card"
            vResizable
            [minWidth]="minWidth()"
            (resizeStart)="resizes.push(['start', $event])"
            (resize)="resizes.push(['resize', $event])"
            (resizeEnd)="resizes.push(['end', $event])">
            <div class="content"></div>
            <span vHandle handleType="source" position="right"></span>
          </div>
        } @else {
          <div class="card">
            <div class="content"></div>
            <span vHandle handleType="source" position="right"></span>
          </div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 400px;
      height: 300px;
    }

    .card {
      /* content-box proves the library adds border-box only for an explicit size */
      box-sizing: content-box;
      min-width: 240px;
      min-height: 120px;
      padding: 10px;
      border: 2px solid;
      border-radius: 8px;
      overflow: hidden;
    }

    .content {
      width: 20px;
      height: 20px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SizeTargetHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly withResizable = signal(true);
  public readonly minWidth = signal<number | undefined>(undefined);
  public readonly nodes = signal<Node[]>(createNodes([{ id: 'node', point: { x: 20, y: 20 } }]));
  public readonly resizes: Array<[string, ResizeEvent]> = [];
}

const SIZED_NODES = () => createNodes([{ id: 'node', point: { x: 20, y: 20 }, width: 300, height: 150 }]);
const POSITIONS: ControlPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

async function createSizeTargetFixture(options: { withResizable?: boolean; nodes?: Node[]; minWidth?: number } = {}) {
  const fixture = TestBed.createComponent(SizeTargetHostComponent);
  fixture.componentInstance.withResizable.set(options.withResizable ?? true);
  fixture.componentInstance.minWidth.set(options.minWidth);
  if (options.nodes) fixture.componentInstance.nodes.set(options.nodes);
  await settle(fixture);

  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    rect: () => fixture.componentInstance.vflow().getNodeRect('node')!,
    card: () => root.querySelector<HTMLElement>('.card')!,
    wrapper: () => root.querySelector<HTMLElement>('.v-node-wrapper')!,
    node: () => root.querySelector<HTMLElement>('[data-v-node]')!,
    controls: () => Array.from(root.querySelectorAll<HTMLElement>('[data-v-resize-control]')),
    control: (position: ControlPosition) =>
      root.querySelector<HTMLElement>(`[data-v-resize-control-position="${position}"]`)!,
  };
}

/** Drags a control in two equal steps and releases it. */
function drag(control: Element, dx: number, dy: number) {
  const from = center(control);
  pointerDrag(control, from, [
    { x: from.x + dx / 2, y: from.y + dy / 2 },
    { x: from.x + dx, y: from.y + dy },
  ]);
}

function center(element: Element) {
  const rect = element.getBoundingClientRect();

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

async function createFixture(options: { useCustomGap?: boolean; enabled?: boolean; autoScale?: boolean } = {}) {
  const fixture = TestBed.createComponent(ResizableTestHostComponent);
  fixture.componentInstance.useCustomGap.set(options.useCustomGap ?? true);
  fixture.componentInstance.enabled.set(options.enabled ?? true);
  fixture.componentInstance.autoScale.set(options.autoScale ?? true);
  await settle(fixture);

  return fixture;
}

/** How far outside the node box the center of each control is, on screen, on each axis the control is placed on. */
function controlGaps(host: HTMLElement) {
  const node = host.querySelector('[data-v-node]')!.getBoundingClientRect();
  return POSITIONS.flatMap((position) => {
    const { x, y } = center(host.querySelector(`[data-v-resize-control-position="${position}"]`)!);
    const gaps: number[] = [];
    if (position.includes('top')) gaps.push(node.top - y);
    if (position.includes('bottom')) gaps.push(y - node.bottom);
    if (position.includes('left')) gaps.push(node.left - x);
    if (position.includes('right')) gaps.push(x - node.right);
    return gaps;
  });
}

describe('VflowResizableComponent', () => {
  it('renders four lines and four corner handles', async () => {
    const fixture = await createFixture();
    const controls = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[data-v-resize-control]'));

    expect(controls.map((control) => control.getAttribute('data-v-resize-control-position'))).toEqual(POSITIONS);
    expect(controls.map((control) => control.getAttribute('data-v-resize-control'))).toEqual([
      ...Array(4).fill('line'),
      ...Array(4).fill('handle'),
    ]);
  });

  it.each([
    { gap: 'the default 1.5px', useCustomGap: false, zoom: 1, expected: 1.5 },
    { gap: 'a custom 4px', useCustomGap: true, zoom: 1, expected: 4 },
    { gap: 'a custom 4px', useCustomGap: true, zoom: 0.5, expected: 2 },
  ])('places every control $gap outside the node at zoom $zoom', async ({ useCustomGap, zoom, expected }) => {
    const fixture = await createFixture({ useCustomGap });
    await fixture.componentInstance.vflow().setViewport({ x: 0, y: 0, zoom });
    await settle(fixture);

    for (const gap of controlGaps(fixture.nativeElement)) expect(gap).toBeCloseTo(expected, 1);
  });

  it.each([
    { autoScale: true, expected: 6 },
    { autoScale: false, expected: 3 },
  ])(
    'draws a 6px corner handle $expected px wide on screen at zoom 0.5 with autoScale $autoScale',
    async ({ autoScale, expected }) => {
      const fixture = await createFixture({ autoScale });
      await fixture.componentInstance.vflow().setViewport({ x: 0, y: 0, zoom: 0.5 });
      await settle(fixture);

      const handle = (fixture.nativeElement as HTMLElement).querySelector('[data-v-resize-control=handle]')!;
      expect(handle.getBoundingClientRect().width).toBeCloseTo(expected, 1);
    },
  );

  it('renders no controls with [vResizable]="false" and keeps the element as the sizing box', async () => {
    const fixture = await createFixture({ enabled: false });
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('[data-v-resize-control]').length).toBe(0);
    expect(host.querySelector<HTMLElement>('.box')!.style.width).toBe('100px');
  });

  describe('size target', () => {
    it('leaves a content-sized node without inline size so the node box follows the element', async () => {
      const { rect, card, wrapper, node } = await createSizeTargetFixture();

      expect(card().style.width).toBe('');
      expect(wrapper().style.width).toBe('');
      // content-box min-width 240 + padding 20 + border 4
      expect(card().offsetWidth).toBe(264);
      expect(node().offsetWidth).toBe(264);
      expect(rect().width).toBe(264);
    });

    it('writes an explicit size to the resizable element as a border box instead of the wrapper', async () => {
      const { card, wrapper, node } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      expect(card().style.width).toBe('300px');
      expect(card().style.height).toBe('150px');
      expect(card().style.boxSizing).toBe('border-box');
      expect(wrapper().style.width).toBe('');
      expect([card().offsetWidth, card().offsetHeight]).toEqual([300, 150]);
      expect([node().offsetWidth, node().offsetHeight]).toEqual([300, 150]);
    });

    it('renders controls in the node layer so a clipping element cannot hide them', async () => {
      const { card, node, controls } = await createSizeTargetFixture();

      expect(controls().length).toBe(8);
      controls().forEach((control) => {
        expect(card().contains(control)).toBe(false);
        expect(node().contains(control)).toBe(true);
      });
    });

    it('sizes the wrapper when the application provides a size without a resizable element', async () => {
      const { card, wrapper, controls } = await createSizeTargetFixture({ withResizable: false, nodes: SIZED_NODES() });

      expect(wrapper().style.width).toBe('300px');
      expect(wrapper().style.height).toBe('150px');
      expect(card().style.width).toBe('');
      expect(controls().length).toBe(0);
    });

    it('hands the size back to the wrapper and removes controls when the resizable element is destroyed', async () => {
      const { fixture, wrapper, controls } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      fixture.componentInstance.withResizable.set(false);
      await settle(fixture);

      expect(controls().length).toBe(0);
      expect(wrapper().style.width).toBe('300px');
    });

    it('makes both axes explicit when a corner resizes a content-sized node', async () => {
      const { fixture, rect, card, control } = await createSizeTargetFixture();

      drag(control('bottom-right'), 40, 30);
      await settle(fixture);

      // 264×144 content size, grown by the drag.
      expect([card().style.width, card().style.height]).toEqual(['304px', '174px']);
      expect(card().offsetWidth).toBe(304);
      expect([rect().width, rect().height]).toEqual([304, 174]);
      // The application gave no size, so the flow adds no size signal to its node.
      expect(fixture.componentInstance.nodes()[0].width).toBeUndefined();
    });

    it('makes only the width explicit when a side control resizes a content-sized node', async () => {
      const { fixture, rect, card, control } = await createSizeTargetFixture();

      drag(control('right'), 40, 0);
      await settle(fixture);

      expect(card().style.width).toBe('304px');
      expect(card().style.height).toBe('');
      // An explicit axis makes the element border-box, so the auto height is now clamped by min-height alone.
      expect(rect().height).toBe(120);
    });

    it('emits resizeStart, a resize per move and resizeEnd for the node of the application', async () => {
      const nodes = SIZED_NODES();
      const { fixture, control } = await createSizeTargetFixture({ nodes });
      const resizes = fixture.componentInstance.resizes;

      drag(control('bottom-right'), 40, 30);
      await settle(fixture);

      expect(resizes.map(([kind]) => kind)).toEqual(['start', 'resize', 'resize', 'end']);
      expect(resizes.every(([, event]) => event.node === nodes[0])).toBe(true);
      expect(resizes.every(([, event]) => event.sourceEvent instanceof PointerEvent)).toBe(true);
    });

    it('reports the size before the gesture at the start and the last size at the end', async () => {
      const { fixture, control } = await createSizeTargetFixture({ nodes: SIZED_NODES() });
      const resizes = fixture.componentInstance.resizes;

      drag(control('bottom-right'), 40, 30);
      await settle(fixture);

      expect(resizes[0][1]).toMatchObject({ x: 20, y: 20, width: 300, height: 150, direction: { x: 0, y: 0 } });
      expect(resizes.at(-1)![1]).toMatchObject({ x: 20, y: 20, width: 340, height: 180, direction: { x: 0, y: 0 } });
    });

    it.each<[ControlPosition, number, number, { x: number; y: number }]>([
      ['bottom-right', 40, 30, { x: 1, y: 1 }],
      ['bottom-right', -40, -30, { x: -1, y: -1 }],
      ['top-left', -20, 0, { x: -1, y: 0 }],
      ['top-left', 20, 20, { x: 1, y: 1 }],
    ])('reports the direction the %s control moved by %i, %i on each axis', async (position, dx, dy, direction) => {
      const { fixture, control } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      drag(control(position), dx, dy);
      await settle(fixture);

      expect(fixture.componentInstance.resizes[1][1].direction).toEqual(direction);
    });

    it('writes the resized size into the application signals', async () => {
      const nodes = SIZED_NODES();
      const { fixture, control } = await createSizeTargetFixture({ nodes });

      drag(control('bottom-right'), 40, 30);
      await settle(fixture);

      expect([nodes[0].width!(), nodes[0].height!()]).toEqual([340, 180]);
    });

    it('applies a programmatic size after a resize', async () => {
      const nodes = SIZED_NODES();
      const { fixture, rect, card, control } = await createSizeTargetFixture({ nodes });

      drag(control('right'), 40, 0);
      await settle(fixture);
      nodes[0].width!.set(260);
      await settle(fixture);

      expect(card().offsetWidth).toBe(260);
      expect(rect().width).toBe(260);
    });

    it('keeps the application size when CSS clamps the rendered box', async () => {
      const nodes = createNodes([{ id: 'node', point: { x: 20, y: 20 }, width: 100, height: 150 }]);
      const { rect, card } = await createSizeTargetFixture({ nodes });

      // CSS min-width wins over the inline width.
      expect(card().offsetWidth).toBe(240);
      expect(rect().width).toBe(240);
      expect(nodes[0].width!()).toBe(100);
    });

    it('fixes only the width when the application provides only a width', async () => {
      const nodes = createNodes([{ id: 'node', point: { x: 20, y: 20 }, width: 300 }]);
      const { rect, card, wrapper } = await createSizeTargetFixture({ nodes, withResizable: false });

      expect(wrapper().style.width).toBe('300px');
      expect(wrapper().style.height).toBe('');
      expect([rect().width, rect().height]).toEqual([300, card().offsetHeight]);
    });

    describe('below the CSS min-width, allowed by [minWidth]="0"', () => {
      /** Presses the right control and moves it 200px left, from 300 to 100, without releasing. */
      async function hold() {
        const target = await createSizeTargetFixture({ nodes: SIZED_NODES(), minWidth: 0 });
        const from = center(target.control('right'));
        dispatchPointer(target.control('right'), 'pointerdown', from);
        dispatchPointer(window, 'pointermove', { x: from.x - 200, y: from.y });
        await settle(target.fixture);
        return { ...target, release: () => dispatchPointer(window, 'pointerup', { x: from.x - 200, y: from.y }) };
      }

      it('keeps the size of the gesture while CSS clamps the box during the resize', async () => {
        const { rect, card, release } = await hold();

        expect(card().offsetWidth).toBe(240);
        expect(rect().width).toBe(100);
        release();
      });

      it('takes the rendered size once the resize ends and leaves the application its size', async () => {
        const { fixture, rect, release } = await hold();

        release();
        await settle(fixture);

        expect(rect().width).toBe(240);
        expect(fixture.componentInstance.nodes()[0].width!()).toBe(100);
      });
    });
  });
});
