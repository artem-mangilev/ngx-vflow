import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  // The graph is wider than the pane on purpose. The first fit keeps the zoom at 1, so the flow opens on the middle
  // of the graph and the minimap shows what lies beyond the visible part.
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ minZoom: 1, maxZoom: 1 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />

    <!-- The frame is ordinary CSS on the element. -->
    <v-minimap vPanel="bottom-right" class="rounded-lg border border-vui-border" [pannable]="true" [zoomable]="true" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class MinimapDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 120 }, data: { text: 'Order' } },
    { id: 'payment', point: { x: 200, y: 0 }, data: { text: 'Payment' } },
    { id: 'stock', point: { x: 200, y: 240 }, data: { text: 'Stock check' } },
    { id: 'invoice', point: { x: 400, y: 0 }, data: { text: 'Invoice' } },
    { id: 'picking', point: { x: 400, y: 240 }, data: { text: 'Picking' } },
    { id: 'packing', point: { x: 600, y: 120 }, data: { text: 'Packing' } },
    { id: 'shipping', point: { x: 800, y: 120 }, data: { text: 'Shipping' } },
    // The two outcomes stand out in the minimap. The color is a token of the theme, so it follows light and dark.
    {
      id: 'delivered',
      point: { x: 1000, y: 0 },
      data: { text: 'Delivered' },
      minimap: { background: 'var(--vui-accent)' },
    },
    {
      id: 'returned',
      point: { x: 1000, y: 240 },
      data: { text: 'Returned' },
      minimap: { background: 'transparent', borderColor: 'var(--vui-accent)', borderWidth: 1 },
    },
  ]);

  protected readonly edges = createEdges([
    { id: 'order-payment', source: 'order', target: 'payment' },
    { id: 'order-stock', source: 'order', target: 'stock' },
    { id: 'payment-invoice', source: 'payment', target: 'invoice' },
    { id: 'stock-picking', source: 'stock', target: 'picking' },
    { id: 'invoice-packing', source: 'invoice', target: 'packing' },
    { id: 'picking-packing', source: 'picking', target: 'packing' },
    { id: 'packing-shipping', source: 'packing', target: 'shipping' },
    { id: 'shipping-delivered', source: 'shipping', target: 'delivered' },
    { id: 'shipping-returned', source: 'shipping', target: 'returned' },
  ]);
}
