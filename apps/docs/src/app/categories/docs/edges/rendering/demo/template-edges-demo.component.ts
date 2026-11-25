import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

/** The application's own field of an edge; the template picks the look of the line from it. */
interface LinkData {
  role: 'primary' | 'standby';
}

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />

    <!-- The interaction stroke sits inside the group, so hovering near the line counts as hovering the group. -->
    <svg:g *vEdge="let ctx of edges" class="group">
      <svg:path
        class="fill-none stroke-2 group-hover:stroke-3"
        [class]="ctx.selected() ? 'stroke-vui-accent' : 'stroke-vui-foreground'"
        [attr.stroke-dasharray]="ctx.data().role === 'standby' ? '6 4' : null"
        [attr.d]="ctx.path()"
        [attr.marker-end]="ctx.markerEnd()" />
    </svg:g>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class TemplateEdgesDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'service', point: { x: 0, y: 45 }, data: { text: 'Service' } },
    { id: 'database', point: { x: 220, y: 0 }, data: { text: 'Database' } },
    { id: 'replica', point: { x: 220, y: 90 }, data: { text: 'Replica' } },
  ]);

  protected readonly edges = createEdges<LinkData>([
    {
      id: 'service-database',
      source: 'service',
      target: 'database',
      data: { role: 'primary' },
      markers: { end: 'arrow-closed' },
    },
    {
      id: 'service-replica',
      source: 'service',
      target: 'replica',
      data: { role: 'standby' },
      markers: { end: 'arrow-closed' },
    },
  ]);
}
