import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { NodeSelectedChange, NodeSizeChange } from '../../types/node-change.type';
import { EdgeChange } from '../../types/edge-change.type';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    style="width: 600px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    (nodesChanges.size)="sizes.push($event)"
    (nodesChanges.select)="selections.push($event)"
    (edgesChanges.select)="edgeSelections.push($event)">
    <div *vNode style="width: 100%; height: 100%">
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path *vEdge="let ctx" [attr.d]="ctx.path()" />
  </vflow>`,
})
class FilteredOutputsHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 }, width: 100, height: 50 },
    { id: 'b', point: { x: 300, y: 0 }, width: 100, height: 50 },
  ]);
  readonly edges = createEdges([{ id: 'a-b', source: 'a', target: 'b' }]);

  sizes: NodeSizeChange[][] = [];
  selections: NodeSelectedChange[][] = [];
  edgeSelections: EdgeChange[][] = [];
}

describe('filtered change outputs', () => {
  let fixture: ComponentFixture<FilteredOutputsHostComponent>;
  let host: FilteredOutputsHostComponent;

  /** Renders the flow and, in one tick, resizes, moves and selects node `a` and selects the edge. */
  beforeEach(async () => {
    fixture = TestBed.createComponent(FilteredOutputsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await new Promise<void>((resolve) => host.flow().initialized.subscribe(() => resolve()));
    await fixture.whenStable();

    const [a] = host.nodes;
    a.width!.set(150);
    a.point.set({ x: 10, y: 10 });
    a.selected.set(true);
    host.edges[0].selected.set(true);
    fixture.detectChanges();
  });

  it('reports only the size changes in (nodesChanges.size)', async () => {
    await expect
      .poll(() => host.sizes)
      .toEqual([
        [{ type: 'size', id: 'a', size: { width: 150, height: 50 }, mode: { width: 'explicit', height: 'explicit' } }],
      ]);
  });

  it('reports only the selection changes in (nodesChanges.select)', async () => {
    await expect.poll(() => host.selections).toEqual([[{ type: 'select', id: 'a', selected: true }]]);
  });

  it('reports only the selection changes in (edgesChanges.select)', async () => {
    await expect.poll(() => host.edgeSelections).toEqual([[{ type: 'select', id: 'a-b', selected: true }]]);
  });
});
