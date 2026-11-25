import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  ReconnectEndEvent,
  ReconnectEvent,
  Vflow,
  createEdges,
  createNodes,
  reconnectEdges,
  removeEdges,
} from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Drag the end of an edge to a port of another node. Released over the canvas, the edge is removed.</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      (reconnect)="reconnect($event)"
      (reconnectEnd)="removeDropped($event)"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class ReconnectionDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'orders', point: { x: 0, y: 0 }, data: { text: 'Orders' } },
    { id: 'returns', point: { x: 0, y: 130 }, data: { text: 'Returns' } },
    { id: 'billing', point: { x: 340, y: 0 }, data: { text: 'Billing' } },
    { id: 'support', point: { x: 340, y: 130 }, data: { text: 'Support' } },
  ]);

  // Each edge is labeled with the ends that can be dragged.
  protected readonly edges = signal(
    createEdges([
      {
        id: 'orders-billing',
        source: 'orders',
        target: 'billing',
        reconnectable: true,
        data: { label: 'Both ends' },
      },
      {
        id: 'returns-support',
        source: 'returns',
        target: 'support',
        reconnectable: 'source',
        data: { label: 'Source end only' },
      },
    ]),
  );

  protected reconnect(event: ReconnectEvent): void {
    this.edges.update((edges) => reconnectEdges([event], { nodes: this.nodes, edges }));
  }

  // `to` is the handle the end was released on; there is none when it was released over the canvas.
  protected removeDropped(event: ReconnectEndEvent): void {
    if (!event.to) {
      this.edges.update((edges) => removeEdges([event.edge.id], edges));
    }
  }
}
