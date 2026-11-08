import { ChangeDetectionStrategy, Component, Directive, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';
import { Subject, of, throwError } from 'rxjs';
import { dispatchMouse } from '../../../ngx-vflow/src/lib/vflow/gestures/pointer-events.testing';
import { VxLayoutAnimate } from './layout-animate.directive';
import { VxLayout } from './layout.directive';
import { LayoutAlgorithm, LayoutGraph, LayoutResult } from './layout.types';
import { NodeAnimatorOptions } from './node-animator';

/** Content-sized cards of 100×50 and one explicit parent; the algorithm is a spy the test controls. */
const template = (animate: string) => `
  <vflow
    [vxLayout]="algorithm()"
    ${animate}
    (vxLayoutEnd)="ended.push($event)"
    (initialized)="initializedAt.push(nodes()[0].point())" style="width: 1200px; height: 800px"
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
`;

@Directive()
class LayoutHost {
  public readonly graphs: LayoutGraph[] = [];
  public readonly ended: LayoutResult[] = [];
  /** The position of the first node when the flow initialized. */
  public readonly initializedAt: { x: number; y: number }[] = [];
  public readonly columns: LayoutAlgorithm = (graph) => {
    this.graphs.push(graph);
    return of({ positions: new Map(graph.nodes.map((node, i) => [node.id, { x: i * 150, y: 300 }])) });
  };
  public readonly algorithm = signal<LayoutAlgorithm>(this.columns);
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

@Component({
  template: template(''),
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow, VxLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LayoutHostComponent extends LayoutHost {}

@Component({
  template: template('[vxLayoutAnimate]="animate()"'),
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow, VxLayout, VxLayoutAnimate],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AnimatedLayoutHostComponent extends LayoutHost {
  public readonly animate = signal<NodeAnimatorOptions>({ duration: 120 });
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

function node(fixture: { componentInstance: LayoutHost }, id: string) {
  return fixture.componentInstance.nodes().find((node) => node.id === id)!;
}

describe('VxLayout', () => {
  async function createFixture() {
    TestBed.configureTestingModule({ imports: [LayoutHostComponent] });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    await settle(fixture);
    return fixture;
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
    // The flow initialized with the layout in place.
    expect(host.initializedAt).toEqual([{ x: 0, y: 300 }]);
  });

  it('lets the flow paint when the layout fails, and reports the error', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      imports: [LayoutHostComponent],
      providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } }],
    });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    fixture.componentInstance.algorithm.set(() => throwError(() => new Error('no layout')));
    await settle(fixture);
    const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

    expect(root.classList.contains('v-initializing')).toBe(false);
    expect(fixture.componentInstance.initializedAt).toEqual([{ x: 0, y: 0 }]);
    expect(errors.map((error) => (error as Error).message)).toEqual(['no layout']);
  });

  it('runs again for a new algorithm function or a new set of nodes, not for a move', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    node(fixture, 'a').point.set({ x: 5, y: 5 });
    await settle(fixture);
    expect(host.graphs).toHaveLength(1);

    // The same layout as a new function: the way to lay the graph out anew after the nodes were moved.
    host.algorithm.set((graph) => host.columns(graph, { drags: new Subject() }));
    await settle(fixture);
    expect(host.graphs).toHaveLength(2);
    expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 300 });

    host.algorithm.set((graph) => {
      host.graphs.push(graph);
      return of({ positions: new Map([['a', { x: 10, y: 10 }]]) });
    });
    await settle(fixture);
    expect(host.graphs).toHaveLength(3);
    expect(node(fixture, 'a').point()).toEqual({ x: 10, y: 10 });

    host.nodes.update((nodes) => [...nodes, ...createNodes([{ id: 'd', point: { x: 0, y: 0 }, data: {} }])]);
    await settle(fixture);
    expect(host.graphs).toHaveLength(4);
    expect(host.graphs[3].nodes.map((node) => node.id)).toContain('d');
  });

  it('drops a run that a newer one replaced', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    const first = new Subject<LayoutResult>();
    const second = new Subject<LayoutResult>();

    host.algorithm.set(() => first);
    await settle(fixture);
    host.algorithm.set(() => second);
    await settle(fixture);
    expect(first.observed).toBe(false);

    second.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });
    second.complete();
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    first.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
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

    host.algorithm.set(() =>
      of({
        positions: new Map([
          ['a', { x: 7, y: 7 }],
          ['b', { x: 8, y: 8 }],
        ]),
      }),
    );
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 7, y: 7 });
    expect(node(fixture, 'b').point()).toEqual(dragged);

    dispatchMouse(window, 'mouseup', { x: left + 25, y: top + 5 });
    await settle(fixture);
    host.algorithm.set(() => of({ positions: new Map([['b', { x: 8, y: 8 }]]) }));
    await settle(fixture);
    expect(node(fixture, 'b').point()).toEqual({ x: 8, y: 8 });
  });

  it('applies every value of a continuous layout and ends with the last one', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    const stream = new Subject<LayoutResult>();
    host.algorithm.set(() => stream);
    await settle(fixture);
    const endedBefore = host.ended.length;

    stream.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
    expect(node(fixture, 'a').point()).toEqual({ x: 1, y: 1 });
    stream.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    expect(host.ended).toHaveLength(endedBefore);

    stream.complete();
    await settle(fixture);
    expect(host.ended).toHaveLength(endedBefore + 1);
    expect(host.ended.at(-1)!.positions.get('a')).toEqual({ x: 2, y: 2 });
  });
});

describe('VxLayout with VxLayoutAnimate', () => {
  it('places the first layout at once, before the first paint, and animates the ones after', async () => {
    TestBed.configureTestingModule({ imports: [AnimatedLayoutHostComponent] });
    const fixture = TestBed.createComponent(AnimatedLayoutHostComponent);
    const host = fixture.componentInstance;
    const first = new Subject<LayoutResult>();
    host.algorithm.set(() => first);
    await settle(fixture);
    const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

    // Measured, laid out asynchronously: not painted and not initialized yet.
    expect(root.classList.contains('v-initializing')).toBe(true);
    expect(host.initializedAt).toEqual([]);

    first.next({ positions: new Map([['a', { x: 640, y: 480 }]]) });
    first.complete();
    await settle(fixture);
    expect(node(fixture, 'a').point()).toEqual({ x: 640, y: 480 });
    expect(root.classList.contains('v-initializing')).toBe(false);
    expect(host.initializedAt).toEqual([{ x: 640, y: 480 }]);
    expect(host.ended).toHaveLength(1);

    host.algorithm.set(() =>
      of({
        positions: new Map([
          ['a', { x: 0, y: 0 }],
          ['group', { x: 400, y: 0 }],
        ]),
        sizes: new Map([['group', { width: 500, height: 400 }]]),
      }),
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const midway = node(fixture, 'a').point();
    expect(midway.x).toBeGreaterThan(0);
    expect(midway.x).toBeLessThan(640);
    // The size of the group travels with the positions.
    const width = node(fixture, 'group').width!();
    expect(width).toBeGreaterThan(300);
    expect(width).toBeLessThan(500);
    expect(host.ended).toHaveLength(1);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 0 });
    expect(node(fixture, 'group').width!()).toBe(500);
    expect(node(fixture, 'group').height!()).toBe(400);
    expect(host.ended).toHaveLength(2);
  });
});
