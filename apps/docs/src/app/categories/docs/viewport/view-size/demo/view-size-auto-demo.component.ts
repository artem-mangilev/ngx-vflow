import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  // The host is the parent of the flow and has the size: the whole window. The flow has none and fills it.
  // It is fixed to the corner of the window because the full screen page of the docs pads its content.
  host: { class: 'fixed top-0 left-0 block h-screen w-screen' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class ViewSizeAutoDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'source', point: { x: 0, y: 0 }, data: { text: 'Source' } },
    { id: 'target', point: { x: 220, y: 90 }, data: { text: 'Target' } },
  ]);

  protected readonly edges = createEdges([{ id: 'source-target', source: 'source', target: 'target' }]);
}
