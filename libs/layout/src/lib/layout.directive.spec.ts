import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';
import { Subject } from 'rxjs';
import { dispatchMouse } from '../../../ngx-vflow/src/lib/vflow/gestures/pointer-events.testing';
import { VxLayout } from './layout.directive';
import { LayoutAlgorithm, LayoutGraph, LayoutResult } from './layout.types';

/** Content-sized cards of 100×50 and one explicit parent; the algorithm is a spy the test controls. */
@Component({
  template: `
    <vflow
      [vxLayout]="algorithm()"
      [vxLayoutTrigger]="trigger()"
      [vxLayoutAnimate]="animate()"
      (vxLayoutEnd)="ended.push($event)"
      [view]="[1200, 800]"
      [nodes]="nodes()"
      [edges]="edges"
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
  imports: [Vflow, VxLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LayoutHostComponent {
  public readonly layout = viewChild.required(VxLayout);
  public readonly graphs: LayoutGraph[] = [];
  public readonly ended: LayoutResult[] = [];
  public readonly trigger = signal<'auto' | 'manual'>('auto');
  public readonly animate = signal<boolean | { duration: number }>(false);
  public readonly algorithm = signal<LayoutAlgorithm>((graph) => {
    this.graphs.push(graph);
    return { positions: new Map(graph.nodes.map((node, i) => [node.id, { x: i * 150, y: 300 }])) };
  });
  public readonly nodes = signal(
    createNodes([
      { id: 'a', point: { x: 0, y: 0 }, data: {} },
      { id: 'b', point: { x: 200, y: 0 }, data: {} },
      { id: 'group', point: { x: 400, y: 0 }, width: 300, height: 200, data: { parent: true } },
      { id: 'c', point: { x: 20, y: 20 }, parentId: 'group', extent: null, data: {} },
    ]),
  );
  public readonly edges = createEdges([{ id: 'a-b', source: 'a', target: 'b' }]);
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('VxLayout', () => {
  async function createFixture() {
    TestBed.configureTestingModule({ imports: [LayoutHostComponent] });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    await settle(fixture);
    return fixture;
  }

  function node(fixture: { componentInstance: LayoutHostComponent }, id: string) {
    return fixture.componentInstance.nodes().find((node) => node.id === id)!;
  }

  it('lays out the measured graph once every node is rendered and applies the positions in node space', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    expect(host.graphs).toHaveLength(1);
    const [graph] = host.graphs;
    expect(graph.nodes.map((node) => [node.id, node.width, node.height, node.parentId])).toEqual([
      ['a', 100, 50, null],
      ['b', 100, 50, null],
      ['group', 300, 200, null],
      ['c', 100, 50, 'group'],
    ]);
    expect(graph.nodes[3]).toMatchObject({ x: 420, y: 20 });
    expect(graph.edges).toEqual([{ id: 'a-b', source: 'a', target: 'b' }]);

    expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 300 });
    expect(node(fixture, 'b').point()).toEqual({ x: 150, y: 300 });
    expect(node(fixture, 'group').point()).toEqual({ x: 300, y: 300 });
    // The child's flow position (450, 300) is relative to the new position of its parent.
    expect(node(fixture, 'c').point()).toEqual({ x: 150, y: 0 });
    expect(host.ended).toHaveLength(1);
  });

  it('runs again for a new algorithm or a new set of nodes, not for a move', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    node(fixture, 'a').point.set({ x: 5, y: 5 });
    await settle(fixture);
    expect(host.graphs).toHaveLength(1);

    host.algorithm.set((graph) => {
      host.graphs.push(graph);
      return { positions: new Map([['a', { x: 10, y: 10 }]]) };
    });
    await settle(fixture);
    expect(host.graphs).toHaveLength(2);
    expect(node(fixture, 'a').point()).toEqual({ x: 10, y: 10 });

    host.nodes.update((nodes) => [...nodes, ...createNodes([{ id: 'd', point: { x: 0, y: 0 }, data: {} }])]);
    await settle(fixture);
    expect(host.graphs).toHaveLength(3);
    expect(host.graphs[2].nodes.map((node) => node.id)).toContain('d');
  });

  it('drops a result that arrives after a newer run started', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    let resolveFirst!: (result: LayoutResult) => void;
    let resolveSecond!: (result: LayoutResult) => void;

    host.algorithm.set(() => new Promise((resolve) => (resolveFirst = resolve)));
    await settle(fixture);
    host.algorithm.set(() => new Promise((resolve) => (resolveSecond = resolve)));
    await settle(fixture);

    resolveSecond({ positions: new Map([['a', { x: 2, y: 2 }]]) });
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    resolveFirst({ positions: new Map([['a', { x: 1, y: 1 }]]) });
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    expect(host.ended).toHaveLength(2);
  });

  it('leaves a node being dragged where it is', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    const card = fixture.nativeElement.querySelector('[data-card="b"]') as HTMLElement;
    const { left, top } = card.getBoundingClientRect();
    dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
    await settle(fixture);
    dispatchMouse(window, 'mousemove', { x: left + 25, y: top + 5 });
    await settle(fixture);
    const dragged = node(fixture, 'b').point();

    host.algorithm.set(() => ({
      positions: new Map([
        ['a', { x: 7, y: 7 }],
        ['b', { x: 8, y: 8 }],
      ]),
    }));
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 7, y: 7 });
    expect(node(fixture, 'b').point()).toEqual(dragged);

    dispatchMouse(window, 'mouseup', { x: left + 25, y: top + 5 });
    await settle(fixture);
    await host.layout().run();
    expect(node(fixture, 'b').point()).toEqual({ x: 8, y: 8 });
  });

  it('animates the nodes into the layout and reports the end afterwards', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    host.animate.set({ duration: 120 });
    await settle(fixture);
    const endedBefore = host.ended.length;

    host.algorithm.set(() => ({ positions: new Map([['a', { x: 500, y: 500 }]]) }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const midway = node(fixture, 'a').point();
    expect(midway.x).toBeGreaterThan(0);
    expect(midway.x).toBeLessThan(500);
    expect(host.ended).toHaveLength(endedBefore);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(node(fixture, 'a').point()).toEqual({ x: 500, y: 500 });
    expect(host.ended).toHaveLength(endedBefore + 1);
  });

  it('applies every value of a continuous layout at once and ends with the last one', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    host.animate.set(true);
    const stream = new Subject<LayoutResult>();
    host.algorithm.set(() => stream);
    await settle(fixture);
    const endedBefore = host.ended.length;

    stream.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
    expect(node(fixture, 'a').point()).toEqual({ x: 1, y: 1 });
    stream.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });
    expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    expect(host.ended).toHaveLength(endedBefore);

    stream.complete();
    await settle(fixture);
    expect(host.ended).toHaveLength(endedBefore + 1);
    expect(host.ended.at(-1)!.positions.get('a')).toEqual({ x: 2, y: 2 });
  });

  it('runs only on demand with the manual trigger', async () => {
    TestBed.configureTestingModule({ imports: [LayoutHostComponent] });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    fixture.componentInstance.trigger.set('manual');
    await settle(fixture);
    const host = fixture.componentInstance;

    expect(host.graphs).toHaveLength(0);
    expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 0 });

    const result = await host.layout().run();
    expect(result?.positions.get('a')).toEqual({ x: 0, y: 300 });
    expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 300 });
    expect(host.graphs).toHaveLength(1);
  });
});
