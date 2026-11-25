import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  // The dots of the background have the gap of the grid, so they mark the points a dragged node snaps to.
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    [snapGrid]="[25, 25]"
    [background]="{ type: 'dots', gap: 25, size: 3 }"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class SnapToGridDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'draft', point: { x: 0, y: 75 }, data: { text: 'Draft' } },
    // The group sits off the grid on purpose: its child still snaps to the cells of the flow, not to cells counted
    // from the corner of the group.
    { id: 'review', point: { x: 163, y: 13 }, width: 175, height: 150, data: { type: 'group', text: 'Review' } },
    { id: 'proofread', point: { x: 37, y: 62 }, parentId: 'review', data: { text: 'Proofread' } },
    { id: 'publish', point: { x: 400, y: 75 }, data: { text: 'Publish' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'draft-proofread', source: 'draft', target: 'proofread' },
    { id: 'proofread-publish', source: 'proofread', target: 'publish' },
  ]);
}
