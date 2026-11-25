import { ChangeDetectionStrategy, Component, Directive, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow, createEdges, createNodes, reconnectEdges, reparentNodes } from 'ngx-vflow';
import { Subject, of, throwError } from 'rxjs';
import { dispatchMouse } from '../../../ngx-vflow/src/lib/vflow/gestures/pointer-events.testing';
import { VxLayoutAnimate } from './layout-animate.directive';
import { VxLayout } from './layout.directive';
import { LayoutAlgorithm, LayoutGraph, LayoutResult } from './layout.types';
import { NodeAnimatorOptions } from './node-animator';
import { LayoutPositionWriter, VX_LAYOUT_POSITION_WRITER } from './position-writer';

/** Content-sized cards of 100×50 and one explicit parent; the algorithm is a spy the test controls. */
const template = (animate: string) => `
  <vflow
    [vxLayout]="algorithm()"
    ${animate}
    (vxLayoutEnd)="ended.push($event)"
    (initialized)="initializedAt.push(nodes()[0].point())" style="width: 1200px; height: 800px"
    [nodes]="nodes()"
    [edges]="edges()"
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
  public readonly edges = signal(createEdges([{ id: 'a-b', source: 'a', target: 'b' }]));
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

@Component({
  template: template('vxLayoutAnimate'),
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow, VxLayout, VxLayoutAnimate],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DefaultAnimationHostComponent extends LayoutHost {}

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

  it('lays out the graph once, with the measured size and parent of every node', async () => {
    const host = (await createFixture()).componentInstance;

    expect(host.graphs).toHaveLength(1);
    expect(host.graphs[0].nodes.map((node) => [node.id, node.width, node.height, node.parentId])).toEqual([
      ['a', 100, 50, null],
      ['b', 100, 50, null],
      ['group', 300, 200, null],
      ['c', 100, 50, 'group'],
    ]);
  });

  it('gives the algorithm the flow position of a nested node', async () => {
    const host = (await createFixture()).componentInstance;

    expect(host.graphs[0].nodes[3]).toMatchObject({ x: 420, y: 20 });
  });

  it('gives the algorithm the edges of the flow', async () => {
    const host = (await createFixture()).componentInstance;

    expect(host.graphs[0].edges).toEqual([{ id: 'a-b', source: 'a', target: 'b' }]);
  });

  it('applies the positions of the layout', async () => {
    const fixture = await createFixture();

    expect([node(fixture, 'a').point(), node(fixture, 'b').point(), node(fixture, 'group').point()]).toEqual([
      { x: 0, y: 300 },
      { x: 150, y: 300 },
      { x: 300, y: 300 },
    ]);
  });

  it('applies the position of a nested node in the space of its parent', async () => {
    const fixture = await createFixture();

    // The flow position (450, 300) is relative to the new position of the parent, (300, 300).
    expect(node(fixture, 'c').point()).toEqual({ x: 150, y: 0 });
  });

  it('reports the result of the layout once', async () => {
    const host = (await createFixture()).componentInstance;

    expect(host.ended).toHaveLength(1);
  });

  it('initializes the flow with the layout in place', async () => {
    const host = (await createFixture()).componentInstance;

    expect(host.initializedAt).toEqual([{ x: 0, y: 300 }]);
  });

  it('lets the flow paint when the layout fails', async () => {
    TestBed.configureTestingModule({
      imports: [LayoutHostComponent],
      providers: [{ provide: ErrorHandler, useValue: { handleError: () => undefined } }],
    });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    fixture.componentInstance.algorithm.set(() => throwError(() => new Error('no layout')));
    await settle(fixture);
    const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

    expect(root.classList.contains('v-initializing')).toBe(false);
    expect(fixture.componentInstance.initializedAt).toEqual([{ x: 0, y: 0 }]);
  });

  it('reports the error of a failed layout to the error handler', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      imports: [LayoutHostComponent],
      providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } }],
    });
    const fixture = TestBed.createComponent(LayoutHostComponent);
    fixture.componentInstance.algorithm.set(() => throwError(() => new Error('no layout')));
    await settle(fixture);

    expect(errors.map((error) => (error as Error).message)).toEqual(['no layout']);
  });

  it('does not run again when a node moves', async () => {
    const fixture = await createFixture();

    node(fixture, 'a').point.set({ x: 5, y: 5 });
    await settle(fixture);

    expect(fixture.componentInstance.graphs).toHaveLength(1);
  });

  it('runs again for the same layout as a new function, and lays the moved nodes out anew', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;
    node(fixture, 'a').point.set({ x: 5, y: 5 });

    host.algorithm.set((graph) => host.columns(graph, { drags: new Subject() }));
    await settle(fixture);

    expect([host.graphs.length, node(fixture, 'a').point()]).toEqual([2, { x: 0, y: 300 }]);
  });

  it('applies the result of a new algorithm', async () => {
    const fixture = await createFixture();

    fixture.componentInstance.algorithm.set(() => of({ positions: new Map([['a', { x: 10, y: 10 }]]) }));
    await settle(fixture);

    expect(node(fixture, 'a').point()).toEqual({ x: 10, y: 10 });
  });

  it('runs again, with the new node, when a node is added', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    host.nodes.update((nodes) => [...nodes, ...createNodes([{ id: 'd', point: { x: 0, y: 0 }, data: {} }])]);
    await settle(fixture);

    expect(host.graphs.at(-1)!.nodes.map((node) => node.id)).toContain('d');
  });

  it('runs again when an edge is reconnected, which keeps every id', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    host.edges.update((edges) =>
      reconnectEdges([{ edge: edges[0], connection: { source: 'b', target: 'a' } }], { nodes: host.nodes(), edges }),
    );
    await settle(fixture);

    expect(host.graphs.at(-1)!.edges).toEqual([expect.objectContaining({ id: 'a-b', source: 'b', target: 'a' })]);
  });

  it('runs again when a node changes its parent, which keeps every id', async () => {
    const fixture = await createFixture();
    const host = fixture.componentInstance;

    reparentNodes([{ id: 'c', parentId: null }], host.nodes());
    await settle(fixture);

    expect(host.graphs.at(-1)!.nodes.find((node) => node.id === 'c')?.parentId).toBeNull();
  });

  describe('a run that a newer one replaces', () => {
    async function replaceRun() {
      const fixture = await createFixture();
      const first = new Subject<LayoutResult>();
      const second = new Subject<LayoutResult>();
      fixture.componentInstance.algorithm.set(() => first);
      await settle(fixture);
      fixture.componentInstance.algorithm.set(() => second);
      await settle(fixture);
      return { fixture, first, second };
    }

    it('is unsubscribed from', async () => {
      const { first } = await replaceRun();

      expect(first.observed).toBe(false);
    });

    it('does not move a node when it emits late', async () => {
      const { fixture, first, second } = await replaceRun();
      second.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });
      second.complete();
      await settle(fixture);

      first.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
      await settle(fixture);

      expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    });

    it('reports only the end of the run that replaced it', async () => {
      const { fixture, second } = await replaceRun();

      second.next({ positions: new Map() });
      second.complete();
      await settle(fixture);

      // The first layout ended before, and the replaced run never does.
      expect(fixture.componentInstance.ended).toHaveLength(2);
    });
  });

  describe('a node being dragged', () => {
    async function dragB() {
      const fixture = await createFixture();
      const card = fixture.nativeElement.querySelector('[data-card="b"]') as HTMLElement;
      const { left, top } = card.getBoundingClientRect();
      dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
      await settle(fixture);
      dispatchMouse(window, 'mousemove', { x: left + 25, y: top + 5 });
      await settle(fixture);
      const release = async () => {
        dispatchMouse(window, 'mouseup', { x: left + 25, y: top + 5 });
        await settle(fixture);
      };
      return { fixture, dragged: node(fixture, 'b').point(), release };
    }
    const lay = (fixture: { componentInstance: LayoutHost }, positions: [string, { x: number; y: number }][]) =>
      fixture.componentInstance.algorithm.set(() => of({ positions: new Map(positions) }));

    it('stays where it is while a layout runs', async () => {
      const { fixture, dragged } = await dragB();

      lay(fixture, [['b', { x: 8, y: 8 }]]);
      await settle(fixture);

      expect(node(fixture, 'b').point()).toEqual(dragged);
    });

    it('does not keep the other nodes from moving', async () => {
      const { fixture } = await dragB();

      lay(fixture, [
        ['a', { x: 7, y: 7 }],
        ['b', { x: 8, y: 8 }],
      ]);
      await settle(fixture);

      expect(node(fixture, 'a').point()).toEqual({ x: 7, y: 7 });
    });

    it('moves with a layout once the drag has ended', async () => {
      const { fixture, release } = await dragB();
      await release();

      lay(fixture, [['b', { x: 8, y: 8 }]]);
      await settle(fixture);

      expect(node(fixture, 'b').point()).toEqual({ x: 8, y: 8 });
    });
  });

  describe('a continuous layout', () => {
    async function runStream() {
      const fixture = await createFixture();
      const stream = new Subject<LayoutResult>();
      fixture.componentInstance.algorithm.set(() => stream);
      await settle(fixture);
      return { fixture, stream, endedBefore: fixture.componentInstance.ended.length };
    }

    it('applies each value as it comes', async () => {
      const { fixture, stream } = await runStream();

      stream.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
      stream.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });
      await settle(fixture);

      expect(node(fixture, 'a').point()).toEqual({ x: 2, y: 2 });
    });

    it('does not report an end while it runs', async () => {
      const { fixture, stream, endedBefore } = await runStream();

      stream.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
      await settle(fixture);

      expect(fixture.componentInstance.ended).toHaveLength(endedBefore);
    });

    it('ends with the last value when it completes', async () => {
      const { fixture, stream } = await runStream();
      stream.next({ positions: new Map([['a', { x: 1, y: 1 }]]) });
      stream.next({ positions: new Map([['a', { x: 2, y: 2 }]]) });

      stream.complete();
      await settle(fixture);

      expect(fixture.componentInstance.ended.at(-1)!.positions.get('a')).toEqual({ x: 2, y: 2 });
    });
  });

  describe('with a custom position writer', () => {
    let write: ReturnType<typeof vi.fn<LayoutPositionWriter['write']>>;
    let cancel: ReturnType<typeof vi.fn<LayoutPositionWriter['cancel']>>;
    let release: () => void;

    /** The first write waits until the test releases it; later ones resolve at once. */
    async function createWithWriter(settleFirst = true) {
      write = vi.fn<LayoutPositionWriter['write']>().mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            release = resolve;
          }),
      );
      write.mockResolvedValue(undefined);
      cancel = vi.fn<LayoutPositionWriter['cancel']>();
      TestBed.configureTestingModule({
        imports: [LayoutHostComponent],
        providers: [{ provide: VX_LAYOUT_POSITION_WRITER, useValue: { write, cancel } }],
      });
      const fixture = TestBed.createComponent(LayoutHostComponent);
      await settle(fixture);
      if (settleFirst) {
        release();
        await settle(fixture);
      }
      return fixture;
    }

    it('receives the targets in node space', async () => {
      const fixture = await createWithWriter();
      const [targets] = write.mock.calls[0];

      expect(targets.get(node(fixture, 'c'))).toEqual({ point: { x: 150, y: 0 } });
    });

    it('receives the size of a parent the layout sized', async () => {
      const fixture = await createWithWriter(false);
      fixture.componentInstance.algorithm.set(() =>
        of({
          positions: new Map([['group', { x: 0, y: 0 }]]),
          sizes: new Map([['group', { width: 500, height: 400 }]]),
        }),
      );
      release();
      await settle(fixture);

      const [targets] = write.mock.calls.at(-1)!;

      expect(targets.get(node(fixture, 'group'))).toEqual({
        point: { x: 0, y: 0 },
        size: { width: 500, height: 400 },
      });
    });

    it('is told the first layout is the first', async () => {
      await createWithWriter();

      expect(write.mock.calls[0][1]).toEqual({ first: true });
    });

    it('is told a later layout is not the first', async () => {
      const fixture = await createWithWriter();

      fixture.componentInstance.algorithm.set((graph) =>
        fixture.componentInstance.columns(graph, { drags: new Subject() }),
      );
      await settle(fixture);

      expect(write.mock.calls.at(-1)![1]).toEqual({ first: false });
    });

    it('is the only one that moves the nodes', async () => {
      const fixture = await createWithWriter();

      expect(node(fixture, 'a').point()).toEqual({ x: 0, y: 0 });
    });

    it('keeps the flow hidden until the first write resolves', async () => {
      const fixture = await createWithWriter(false);
      const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

      expect(root.classList.contains('v-initializing')).toBe(true);
    });

    it('lets the flow paint once the first write resolves', async () => {
      const fixture = await createWithWriter(false);
      const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

      release();
      await settle(fixture);

      expect(root.classList.contains('v-initializing')).toBe(false);
    });

    it('is cancelled when a run ends', async () => {
      await createWithWriter();

      expect(cancel).toHaveBeenCalled();
    });
  });
});

describe('VxLayout with VxLayoutAnimate', () => {
  afterEach(() => vi.useRealTimers());

  /** A flow whose first layout is held back by the returned subject. */
  async function createFixture() {
    TestBed.configureTestingModule({ imports: [AnimatedLayoutHostComponent] });
    const fixture = TestBed.createComponent(AnimatedLayoutHostComponent);
    const first = new Subject<LayoutResult>();
    fixture.componentInstance.algorithm.set(() => first);
    await settle(fixture);
    return { fixture, host: fixture.componentInstance, first };
  }

  async function createLaidOut() {
    const { fixture, host, first } = await createFixture();
    first.next({ positions: new Map([['a', { x: 640, y: 480 }]]) });
    first.complete();
    await settle(fixture);
    // From here on the animation runs on frames the test advances.
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    return { fixture, host };
  }

  async function flush(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.advanceTimersByTimeAsync(0);
  }

  const toOrigin: LayoutAlgorithm = () =>
    of({
      positions: new Map([
        ['a', { x: 0, y: 0 }],
        ['group', { x: 400, y: 0 }],
      ]),
      sizes: new Map([['group', { width: 500, height: 400 }]]),
    });

  it('holds the flow back while the first layout is not in', async () => {
    const { fixture, host } = await createFixture();
    const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

    expect([root.classList.contains('v-initializing'), host.initializedAt]).toEqual([true, []]);
  });

  it('places the first layout at once', async () => {
    const { fixture, first } = await createFixture();

    first.next({ positions: new Map([['a', { x: 640, y: 480 }]]) });
    first.complete();
    await settle(fixture);

    expect(node(fixture, 'a').point()).toEqual({ x: 640, y: 480 });
  });

  it('initializes the flow with the first layout in place', async () => {
    const { fixture, host, first } = await createFixture();

    first.next({ positions: new Map([['a', { x: 640, y: 480 }]]) });
    first.complete();
    await settle(fixture);

    expect(host.initializedAt).toEqual([{ x: 640, y: 480 }]);
  });

  it('moves the nodes of a later layout gradually', async () => {
    const { fixture, host } = await createLaidOut();

    host.algorithm.set(toOrigin);
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(80);

    const { x } = node(fixture, 'a').point();
    expect(x > 0 && x < 640).toBe(true);
  });

  it('resizes a parent gradually with the positions', async () => {
    const { fixture, host } = await createLaidOut();

    host.algorithm.set(toOrigin);
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(80);

    const width = node(fixture, 'group').width!();
    expect(width > 300 && width < 500).toBe(true);
  });

  it('does not report the end of a later layout before the animation is over', async () => {
    const { fixture, host } = await createLaidOut();

    host.algorithm.set(toOrigin);
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(80);

    expect(host.ended).toHaveLength(1);
  });

  it('puts the nodes on the targets of a later layout when the animation is over', async () => {
    const { fixture, host } = await createLaidOut();

    host.algorithm.set(toOrigin);
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(400);

    expect([node(fixture, 'a').point(), node(fixture, 'group').width!(), node(fixture, 'group').height!()]).toEqual([
      { x: 0, y: 0 },
      500,
      400,
    ]);
  });

  it('reports the end of a later layout once the animation is over', async () => {
    const { fixture, host } = await createLaidOut();

    host.algorithm.set(toOrigin);
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(400);

    expect(host.ended).toHaveLength(2);
  });

  it('stops the running animation when new options and a new layout come in the same change', async () => {
    const { fixture, host } = await createLaidOut();
    const to = (x: number) => () => of({ positions: new Map([['a', { x, y: 0 }]]) });
    host.animate.set({ duration: 1000 });
    host.algorithm.set(to(0));
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(64);

    host.animate.set({ duration: 100 });
    host.algorithm.set(to(900));
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(1500);

    // The slow animation towards the first layout must not finish last and pull the node back.
    expect(node(fixture, 'a').point()).toEqual({ x: 900, y: 0 });
  });

  it('animates with the default options when the directive has none', async () => {
    TestBed.configureTestingModule({ imports: [DefaultAnimationHostComponent] });
    const fixture = TestBed.createComponent(DefaultAnimationHostComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });

    host.algorithm.set(() => of({ positions: new Map([['a', { x: 1000, y: 0 }]]) }));
    await flush(fixture);
    await vi.advanceTimersByTimeAsync(80);

    const { x } = node(fixture, 'a').point();
    expect(x > 0 && x < 1000).toBe(true);
  });
});
