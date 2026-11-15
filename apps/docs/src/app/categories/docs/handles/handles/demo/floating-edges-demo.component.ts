import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <div *vNode="let ctx" vuiNode class="flex h-12.5 w-25 items-center justify-center text-[13px]">
      {{ ctx.data().text }}

      <!-- One handle whose point follows the other end of each edge: the node has no ports. -->
      <span vHandle handleType="any" position="auto"></span>
    </div>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class FloatingEdgesDemoComponent {
  // Drag a node around the roadmap: each edge moves to the sides that face each other.
  protected readonly nodes = createNodes([
    { id: 'roadmap', point: { x: 190, y: 110 }, data: { text: 'Roadmap' } },
    { id: 'research', point: { x: 190, y: 0 }, data: { text: 'Research' } },
    { id: 'design', point: { x: 380, y: 110 }, data: { text: 'Design' } },
    { id: 'build', point: { x: 190, y: 220 }, data: { text: 'Build' } },
    { id: 'launch', point: { x: 0, y: 110 }, data: { text: 'Launch' } },
  ]);

  protected readonly edges = createEdges(
    ['research', 'design', 'build', 'launch'].map((target) => ({
      id: `roadmap-${target}`,
      source: 'roadmap',
      target,
      markers: { end: 'arrow-closed' },
    })),
  );
}
