import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vflow, VflowComponent, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <button docsButton type="button" (click)="flow().fitView({ maxZoom: 1, duration: 300 })">Fit view</button>
      <button docsButton type="button" (click)="flow().fitView({ nodes: ['shipping'], padding: 2, duration: 300 })">
        Zoom to Shipping
      </button>
      <button docsButton type="button" (click)="center('cart')">Center on Cart</button>
      <button docsButton type="button" (click)="flow().zoomIn({ duration: 150 })">Zoom in</button>
      <button docsButton type="button" (click)="flow().zoomOut({ duration: 150 })">Zoom out</button>
      <output class="ms-auto text-vui-muted tabular-nums">{{ (flow().viewport().zoom * 100).toFixed(0) }}%</output>
    </div>

    <!-- The first fit and the button ask for the same viewport, so "Fit view" always brings the first view back. -->
    <vflow
      [nodes]="nodes"
      [edges]="edges"
      [background]="{ type: 'dots' }"
      (initialized)="flow().fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class ViewportControlDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);

  protected readonly nodes = createNodes([
    { id: 'cart', point: { x: 0, y: 0 }, data: { text: 'Cart' } },
    { id: 'payment', point: { x: 180, y: 70 }, data: { text: 'Payment' } },
    { id: 'shipping', point: { x: 360, y: 140 }, data: { text: 'Shipping' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'cart-payment', source: 'cart', target: 'payment' },
    { id: 'payment-shipping', source: 'payment', target: 'shipping' },
  ]);

  // setCenter() takes a point of the graph and keeps the zoom; the rectangle of the node gives its middle.
  protected center(id: string): void {
    const rect = this.flow().getNodeRect(id);

    if (rect) {
      this.flow().setCenter({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, { duration: 300 });
    }
  }
}
