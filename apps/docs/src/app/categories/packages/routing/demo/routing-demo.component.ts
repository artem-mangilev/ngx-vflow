import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { avoidNodesCurve } from '@vflow/routing';
import { Vflow, createEdges, createNodes, provideVflow, withCurves } from 'ngx-vflow';

@Component({
  // On a grid the dragged nodes stay aligned, so the straight runs of the routes stay straight.
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    [snapGrid]="[10, 10]"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
  // The curve is registered once and the edges name it, so the graph holds no functions.
  providers: [provideVflow(withCurves({ avoid: avoidNodesCurve }))],
})
export class RoutingDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'source', point: { x: 0, y: 0 }, data: { text: 'Source' } },
    { id: 'clean', point: { x: 210, y: 0 }, data: { text: 'Clean' } },
    { id: 'enrich', point: { x: 420, y: 0 }, data: { text: 'Enrich' } },
    { id: 'publish', point: { x: 630, y: 0 }, data: { text: 'Publish' } },
    { id: 'archive', point: { x: 0, y: 150 }, width: 440, height: 160, data: { text: 'Archive', type: 'group' } },
    { id: 'compress', point: { x: 30, y: 70 }, parentId: 'archive', data: { text: 'Compress' } },
    { id: 'upload', point: { x: 310, y: 70 }, parentId: 'archive', data: { text: 'Upload' } },
  ]);

  protected readonly edges = createEdges(
    [
      // Runs around Clean and Enrich, which stand between its ends.
      { id: 'source-publish', source: 'source', target: 'publish' },
      { id: 'clean-enrich', source: 'clean', target: 'enrich' },
      // The target handle faces away, so the route loops around Upload to reach it.
      { id: 'enrich-upload', source: 'enrich', target: 'upload' },
      // Stays inside the group: the ancestors of the nodes of an edge are not obstacles.
      { id: 'compress-upload', source: 'compress', target: 'upload' },
    ].map((edge) => ({ ...edge, curve: 'avoid', markers: { end: { type: 'arrow-closed' as const } } })),
  );
}
