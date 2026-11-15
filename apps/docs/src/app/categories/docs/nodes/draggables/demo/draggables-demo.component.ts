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
export class DraggablesDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'draggable', point: { x: 0, y: 0 }, data: { text: 'Draggable' } },
    { id: 'locked', point: { x: 220, y: 90 }, data: { text: 'Locked' }, draggable: false },
  ]);

  protected readonly edges = createEdges([{ id: 'draggable-locked', source: 'draggable', target: 'locked' }]);
}
