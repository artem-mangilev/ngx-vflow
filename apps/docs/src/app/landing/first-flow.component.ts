import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Vui } from '@vflow/ui';
import { addEdges, Connection, createNodes, Edge, Vflow } from 'ngx-vflow';

/**
 * The flow of the quickstart as the landing page shows it: the same nodes and the same template, plus the zoom buttons
 * every flow of the landing has. The quickstart keeps its own copy, which is the code of that page and installs only
 * `ngx-vflow`. The colors are the system ones the quickstart uses, so the two look the same.
 */
@Component({
  selector: 'app-landing-first-flow',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-80' },
  template: `
    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      (connect)="connect($event)"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <div
        *vNode="let ctx of nodes"
        class="rounded-lg border bg-[color:Canvas] px-4 py-2.5 text-sm text-[color:CanvasText]"
        [class]="ctx.selected() ? 'border-[color:Highlight] shadow-[0_0_0_1px_Highlight]' : 'border-[color:GrayText]'">
        <span vHandle handleType="target" position="left" [class]="port"></span>
        {{ ctx.data().label }}
        <span vHandle handleType="source" position="right" [class]="port"></span>
      </div>

      <svg:g *vEdge="let ctx" vEdgeInteractionArea>
        <svg:path
          class="fill-none stroke-2"
          [class]="ctx.selected() ? 'stroke-[color:Highlight]' : 'stroke-[color:GrayText]'"
          [attr.d]="ctx.path()" />
      </svg:g>

      <vui-controls vPanel="bottom-left" />
    </vflow>
  `,
})
export class FirstFlowComponent {
  protected readonly port =
    'size-2.5 rounded-full border border-[color:GrayText] bg-[color:Canvas] data-[v-handle-state=valid]:bg-[color:Highlight]';

  protected readonly nodes = createNodes([
    { id: 'fetch', point: { x: 40, y: 120 }, data: { label: 'Fetch orders' } },
    { id: 'filter', point: { x: 280, y: 60 }, data: { label: 'Keep unpaid' } },
    { id: 'remind', point: { x: 280, y: 180 }, data: { label: 'Send reminder' } },
  ]);

  protected readonly edges = signal<Edge[]>([{ id: 'fetch-filter', source: 'fetch', target: 'filter' }]);

  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }
}
