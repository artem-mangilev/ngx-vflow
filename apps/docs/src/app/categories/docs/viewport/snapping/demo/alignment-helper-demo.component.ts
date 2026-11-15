import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    [alignmentHelper]="true"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class AlignmentHelperDemoComponent {
  // The layout is left untidy on purpose: every node has something to align with.
  protected readonly nodes = createNodes([
    { id: 'build', point: { x: 10, y: 10 }, data: { text: 'Build' } },
    { id: 'ci', point: { x: 150, y: 10 }, width: 250, height: 200, data: { type: 'group', text: 'CI' } },
    // Off the center of its group.
    { id: 'test', point: { x: 40, y: 110 }, parentId: 'ci', data: { text: 'Test' } },
    // Not level with `Test`: the edge between them is bent.
    { id: 'deploy', point: { x: 450, y: 90 }, data: { text: 'Deploy' } },
    { id: 'logs', point: { x: 10, y: 250 }, data: { text: 'Logs' } },
    { id: 'metrics', point: { x: 300, y: 250 }, data: { text: 'Metrics' } },
    // Fits into the gap between `Logs` and `Metrics`.
    { id: 'alerts', point: { x: 450, y: 180 }, data: { text: 'Alerts' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'build-test', source: 'build', target: 'test' },
    { id: 'test-deploy', source: 'test', target: 'deploy' },
  ]);
}
