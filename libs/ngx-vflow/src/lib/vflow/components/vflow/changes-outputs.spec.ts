import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { NodeChange, NodePositionChange } from '../../types/node-change.type';
import { EdgeDetachedChange } from '../../types/edge-change.type';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="nodes()"
    [edges]="edges"
    [view]="[600, 350]"
    (nodesChanges)="all.push($event)"
    (nodesChanges.position)="positions.push($event)"
    (edgesChanges.detached)="detached.push($event)">
    <ng-template vNode>
      <div style="width: 100px; height: 50px">
        <span vHandle handleType="target" position="left"></span
        ><span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template vEdge let-ctx><svg:path [attr.d]="ctx.path()" /></ng-template>
  </vflow>`,
})
class ChangesHostComponent {
  flow = viewChild.required(VflowComponent);
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
  detached: EdgeDetachedChange[][] = [];
}

describe('change outputs of the flow', () => {
  const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

  async function setup() {
    TestBed.configureTestingModule({
      imports: [ChangesHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ChangesHostComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const code: NodeChange[][] = [];
    host.flow().nodesChanges.subscribe((changes) => code.push(changes));

    const stable = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      await settle();
    };

    // The first layout reports the measured sizes.
    await stable();
    host.all.length = host.positions.length = host.detached.length = code.length = 0;

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

  it('puts every type of one tick into (nodesChanges) and only its own type into a filtered output', async () => {
    const { host, stable } = await setup();
    const [a] = host.nodes();

    a.point.set({ x: 10, y: 10 });
    a.selected.set(true);
    await stable();

    expect(host.all.length).toBe(1);
    expect(host.all[0]).toEqual(
      jasmine.arrayWithExactContents([
        { type: 'position', id: 'a', point: { x: 10, y: 10 } },
        { type: 'select', id: 'a', selected: true },
      ]),
    );
    expect(host.positions).toEqual([[{ type: 'position', id: 'a', point: { x: 10, y: 10 } }]]);
  });

  it('reports the edges detached by a removed node as one array', async () => {
    const { host, stable } = await setup();

    host.nodes.update((nodes) => nodes.filter((node) => node.id !== 'a'));
    await stable();

    expect(host.detached.length).toBe(1);
    expect(host.detached[0]).toEqual(
      jasmine.arrayWithExactContents([
        { type: 'detached', id: 'a-b' },
        { type: 'detached', id: 'a-c' },
      ]),
    );
  });
});
