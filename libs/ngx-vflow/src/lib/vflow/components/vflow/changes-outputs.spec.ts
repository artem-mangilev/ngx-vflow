import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { NodeChange, NodePositionChange } from '../../types/node-change.type';
import { EdgeChange, EdgeDetachedChange } from '../../types/edge-change.type';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="nodes()"
    [edges]="edges"
    style="width: 600px; height: 350px"
    (nodesChanges)="all.push($event)"
    (nodesChanges.position)="positions.push($event)"
    (edgesChanges)="edgeChanges.push($event)"
    (edgesChanges.detached)="detached.push($event)"
    (initialized)="initialized = { edgeChanges: edgeChanges.slice(), detached: detached.slice() }">
    <div *vNode="let ctx" style="width: 100px; height: 50px">
      @if (ctx.node.id !== withoutTarget()) {
        <span vHandle handleType="target" position="left"></span>
      }
      <span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path *vEdge="let ctx" [attr.d]="ctx.path()" />
  </vflow>`,
})
class ChangesHostComponent {
  flow = viewChild.required(VflowComponent);
  withoutTarget = signal<string | null>(null);
  nodes = signal(
    createNodes([
      { id: 'a', point: { x: 0, y: 0 } },
      { id: 'b', point: { x: 200, y: 0 } },
      { id: 'c', point: { x: 400, y: 0 } },
    ]),
  );
  edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b' },
    { id: 'a-c', source: 'a', target: 'c' },
  ]);

  all: NodeChange[][] = [];
  positions: NodePositionChange[][] = [];
  edgeChanges: EdgeChange[][] = [];
  detached: EdgeDetachedChange[][] = [];
  initialized: { edgeChanges: EdgeChange[][]; detached: EdgeDetachedChange[][] } | null = null;
}

describe('change outputs of the flow', () => {
  /** Node changes reach the application 25 ms after the tick that made them. */
  const DELIVERY = 25;

  afterEach(() => vi.useRealTimers());

  async function render() {
    TestBed.configureTestingModule({ imports: [ChangesHostComponent] });
    const fixture = TestBed.createComponent(ChangesHostComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    await new Promise<void>((resolve) => host.flow().initialized.subscribe(() => resolve()));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });

    const stable = async () => {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(DELIVERY);
    };
    await stable();

    return { host, stable };
  }

  async function setup() {
    const { host, stable } = await render();
    const code: NodeChange[][] = [];
    host.flow().nodesChanges.subscribe((changes) => code.push(changes));

    // The first layout reports the measured sizes.
    host.all.length = host.positions.length = host.edgeChanges.length = host.detached.length = 0;

    return { host, code, stable };
  }

  it('delivers the positions of one tick as one array to template and code listeners', async () => {
    const { host, code, stable } = await setup();
    const [a, b] = host.nodes();

    a.point.set({ x: 10, y: 10 });
    b.point.set({ x: 210, y: 10 });
    await stable();

    const expected = [
      [
        { type: 'position', id: 'a', point: { x: 10, y: 10 } },
        { type: 'position', id: 'b', point: { x: 210, y: 10 } },
      ],
    ];
    expect(host.all).toEqual(expected as NodeChange[][]);
    expect(host.positions).toEqual(expected as NodePositionChange[][]);
    expect(code).toEqual(expected as NodeChange[][]);
  });

  it('puts every type of one tick into (nodesChanges)', async () => {
    const { host, stable } = await setup();
    const [a] = host.nodes();

    a.point.set({ x: 10, y: 10 });
    a.selected.set(true);
    await stable();

    expect(host.all).toEqual([
      expect.arrayContaining([
        { type: 'position', id: 'a', point: { x: 10, y: 10 } },
        { type: 'select', id: 'a', selected: true },
      ]),
    ]);
    expect(host.all[0]).toHaveLength(2);
  });

  it('puts only its own type into a filtered output', async () => {
    const { host, stable } = await setup();
    const [a] = host.nodes();

    a.point.set({ x: 10, y: 10 });
    a.selected.set(true);
    await stable();

    expect(host.positions).toEqual([[{ type: 'position', id: 'a', point: { x: 10, y: 10 } }]]);
  });

  it('reports no position of a selected node that did not move', async () => {
    const { host, stable } = await setup();
    const [a, b] = host.nodes();
    b.selected.set(true);
    await stable();
    host.positions.length = 0;

    a.point.set({ x: 20, y: 0 });
    await stable();

    expect(host.positions).toEqual([[{ type: 'position', id: 'a', point: { x: 20, y: 0 } }]]);
  });

  it('reports the edges detached by a removed node as one array', async () => {
    const { host, stable } = await setup();

    host.nodes.update((nodes) => nodes.filter((node) => node.id !== 'a'));
    await stable();

    expect(host.detached).toEqual([
      expect.arrayContaining([
        { type: 'detached', id: 'a-b' },
        { type: 'detached', id: 'a-c' },
      ]),
    ]);
    expect(host.detached[0]).toHaveLength(2);
    expect(host.edgeChanges).toEqual(host.detached);
  });

  it('reports no change of a node the application removed', async () => {
    const { host, stable } = await setup();

    host.nodes.update((nodes) => nodes.filter((node) => node.id !== 'a'));
    await stable();

    expect(host.all).toEqual([]);
  });

  it('reports no edge as detached while its handles are not yet measured at startup', async () => {
    const { host } = await render();

    expect(host.initialized).toEqual({ edgeChanges: [], detached: [] });
    expect(host.edgeChanges).toEqual([]);
    expect(host.flow().detachedEdges()).toEqual([]);
  });

  it('reports an edge whose node stops rendering its handle after the first layout', async () => {
    const { host, stable } = await setup();

    host.withoutTarget.set('b');
    await stable();

    expect(host.detached).toEqual([[{ type: 'detached', id: 'a-b' }]]);
    expect(host.flow().detachedEdges()).toEqual([host.edges[0]]);
  });

  it('reports a selection change of an edge', async () => {
    const { host, stable } = await setup();

    host.edges[1].selected.set(true);
    await stable();

    expect(host.edgeChanges).toEqual([[{ type: 'select', id: 'a-c', selected: true }]]);
  });
});
