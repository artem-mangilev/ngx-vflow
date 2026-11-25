import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class DefaultEdgesDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'commit', point: { x: 0, y: 45 }, data: { text: 'Commit' } },
    { id: 'build', point: { x: 220, y: 0 }, data: { text: 'Build' } },
    { id: 'lint', point: { x: 220, y: 90 }, data: { text: 'Lint' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'commit-build', source: 'commit', target: 'build' },
    { id: 'commit-lint', source: 'commit', target: 'lint' },
  ]);
}
