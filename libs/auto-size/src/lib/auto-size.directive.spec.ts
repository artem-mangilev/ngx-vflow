import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node, Vflow, createNodes } from 'ngx-vflow';
import { dispatchMouse } from '../../../ngx-vflow/src/lib/vflow/gestures/pointer-events.testing';
import { VxAutoSize } from './auto-size.directive';

/** Parents are sized by their signals; children are content-sized cards of 100×50. */
@Component({
  template: `
    <vflow
      vxAutoSize
      [vxAutoSizePadding]="padding()"
      [vxAutoSizeShouldResize]="shouldResize()"
      [vxAutoSizeShrink]="shrink()"
      [view]="[1200, 800]"
      [nodes]="nodes"
      [nodeDragThreshold]="0"
      [autoPan]="false">
      <ng-template let-ctx vNode>
        @if (ctx.data().parent) {
          <div class="parent" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()"></div>
        } @else {
          <div class="card" [attr.data-card]="ctx.node.id"></div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow, VxAutoSize],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AutoSizeHostComponent {
  public readonly padding = signal<number | { left?: number; top?: number; right?: number; bottom?: number }>(10);
  public readonly shouldResize = signal<(parent: Node) => boolean>(() => true);
  public readonly shrink = signal(false);
  public readonly nodes = createNodes([
    { id: 'group', point: { x: 100, y: 100 }, width: 300, height: 200, data: { parent: true } },
    { id: 'child', point: { x: 50, y: 50 }, parentId: 'group', extent: null, data: {} },
    { id: 'outer', point: { x: 600, y: 100 }, width: 300, height: 300, data: { parent: true } },
    {
      id: 'inner',
      point: { x: 20, y: 20 },
      parentId: 'outer',
      extent: null,
      width: 200,
      height: 200,
      data: { parent: true },
    },
    { id: 'leaf', point: { x: 10, y: 10 }, parentId: 'inner', extent: null, data: {} },
    // Only the width is explicit: the height follows the content.
    { id: 'wide', point: { x: 100, y: 500 }, width: 300, data: { parent: true } },
    { id: 'wide-child', point: { x: 50, y: 20 }, parentId: 'wide', extent: null, data: {} },
  ]);
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('VxAutoSize', () => {
  async function createFixture() {
    TestBed.configureTestingModule({ imports: [AutoSizeHostComponent] });
    const fixture = TestBed.createComponent(AutoSizeHostComponent);
    await settle(fixture);
    return fixture;
  }

  function node(fixture: { componentInstance: AutoSizeHostComponent }, id: string) {
    return fixture.componentInstance.nodes.find((node) => node.id === id)!;
  }

  /** Presses the card of a node and moves the pointer by the given client offsets, one frame each. */
  async function drag(fixture: Awaited<ReturnType<typeof createFixture>>, id: string, ...moves: [number, number][]) {
    const card = fixture.nativeElement.querySelector(`[data-card="${id}"]`) as HTMLElement;
    const { left, top } = card.getBoundingClientRect();
    dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
    await settle(fixture);
    let last: [number, number] = [0, 0];
    for (const [dx, dy] of moves) {
      last = [dx, dy];
      dispatchMouse(window, 'mousemove', { x: left + 5 + dx, y: top + 5 + dy });
      await settle(fixture);
    }
    dispatchMouse(window, 'mouseup', { x: left + 5 + last[0], y: top + 5 + last[1] });
    await settle(fixture);
  }

  it('grows a parent to the right and bottom while a child is dragged past its sides', async () => {
    const fixture = await createFixture();
    const group = node(fixture, 'group');

    await drag(fixture, 'child', [100, 0], [200, 120]);

    expect(node(fixture, 'child').point()).toEqual({ x: 250, y: 170 });
    expect(group.point()).toEqual({ x: 100, y: 100 });
    expect(group.width!()).toBe(360);
    expect(group.height!()).toBe(230);
  });

  it('grows a parent to the left and top by moving its origin and keeping the children in place', async () => {
    const fixture = await createFixture();
    const group = node(fixture, 'group');
    const child = node(fixture, 'child');
    const { vflow } = fixture.componentInstance as unknown as { vflow?: never };
    void vflow;

    await drag(fixture, 'child', [-60, -80]);

    // The child is at (-10, -30) of the old origin: the parent moves by (-20, -40) and grows by as much.
    expect(group.point()).toEqual({ x: 80, y: 60 });
    expect(group.width!()).toBe(320);
    expect(group.height!()).toBe(240);
    expect(child.point()).toEqual({ x: 10, y: 10 });
    const card = fixture.nativeElement.querySelector('[data-card="child"]') as HTMLElement;
    const parent = fixture.nativeElement.querySelector('[data-v-node="group"]') as HTMLElement;
    expect(card.getBoundingClientRect().left - parent.getBoundingClientRect().left).toBe(10);
  });

  it('grows every level of nesting, the deepest first', async () => {
    const fixture = await createFixture();

    await drag(fixture, 'leaf', [250, 0]);

    expect(node(fixture, 'leaf').point()).toEqual({ x: 260, y: 10 });
    expect(node(fixture, 'inner').width!()).toBe(370);
    expect(node(fixture, 'outer').width!()).toBe(400);
    expect(node(fixture, 'inner').height!()).toBe(200);
  });

  it('leaves out the parents the predicate declines and the axes without an explicit size', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.shouldResize.set((parent) => parent.id !== 'group');
    await settle(fixture);

    await drag(fixture, 'child', [200, 0]);
    expect(node(fixture, 'group').width!()).toBe(300);

    const wide = node(fixture, 'wide');
    await drag(fixture, 'wide-child', [200, 100]);
    expect(wide.width!()).toBe(360);
    expect(wide.height).toBeUndefined();
    expect(wide.point()).toEqual({ x: 100, y: 500 });
  });

  it('shrinks a parent to its children when the drag ends, if asked to', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.shrink.set(true);
    await settle(fixture);
    const group = node(fixture, 'group');

    await drag(fixture, 'child', [10, 0]);

    expect(group.point()).toEqual({ x: 150, y: 140 });
    expect(group.width!()).toBe(120);
    expect(group.height!()).toBe(70);
    expect(node(fixture, 'child').point()).toEqual({ x: 10, y: 10 });
  });

  it('takes the padding per side', async () => {
    const fixture = await createFixture();
    fixture.componentInstance.padding.set({ right: 40, bottom: 5 });
    await settle(fixture);

    await drag(fixture, 'child', [200, 150]);

    expect(node(fixture, 'group').width!()).toBe(390);
    expect(node(fixture, 'group').height!()).toBe(255);
  });
});
