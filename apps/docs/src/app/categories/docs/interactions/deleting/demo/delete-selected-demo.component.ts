import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { DeleteRequest, Vflow, createEdges, createNodes, removeElements } from 'ngx-vflow';

const HINT = 'Select a node or an edge, then press Delete or Backspace.';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p aria-live="polite">{{ status() }}</p>
      <button docsButton type="button" class="ms-auto" [disabled]="status() === hint" (click)="restore()">
        Restore
      </button>
    </div>

    <vflow
      #flow
      [nodes]="nodes()"
      [edges]="edges()"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (deleteRequest)="remove($event)">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class DeleteSelectedDemoComponent {
  protected readonly hint = HINT;
  protected readonly status = signal(HINT);

  protected readonly nodes = signal(orderNodes());
  protected readonly edges = signal(orderEdges());

  /**
   * The flow only asks: the graph belongs to the application. `removeElements` also takes the descendants of the
   * removed nodes and the edges attached to them.
   */
  protected remove(request: DeleteRequest): void {
    const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });

    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
    this.status.set(`Removed ${count(result.removedNodes, 'node')} and ${count(result.removedEdges, 'edge')}.`);
  }

  protected restore(): void {
    this.nodes.set(orderNodes());
    this.edges.set(orderEdges());
    this.status.set(HINT);
  }
}

function orderNodes() {
  return createNodes([
    { id: 'order', point: { x: 0, y: 60 }, data: { text: 'Order' } },
    { id: 'invoice', point: { x: 200, y: 0 }, data: { text: 'Invoice' } },
    { id: 'shipment', point: { x: 200, y: 120 }, data: { text: 'Shipment' } },
    { id: 'delivery', point: { x: 400, y: 120 }, data: { text: 'Delivery' } },
  ]);
}

function orderEdges() {
  return createEdges([
    { id: 'order-invoice', source: 'order', target: 'invoice' },
    { id: 'order-shipment', source: 'order', target: 'shipment' },
    { id: 'shipment-delivery', source: 'shipment', target: 'delivery' },
  ]);
}

function count(items: readonly unknown[], noun: string): string {
  return `${items.length} ${noun}${items.length === 1 ? '' : 's'}`;
}
