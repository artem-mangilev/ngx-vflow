import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Point, Vflow, VflowComponent, createEdges, createNodes } from 'ngx-vflow';

interface Lane {
  title: string;
  point: Point;
}

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1, padding: 0.15 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />

    <!-- Below the graph: a lane behind each team's steps. -->
    @for (lane of lanes; track lane.title) {
      <div
        *vPortal="lane.point; layer: 'below'"
        class="h-35 w-180 rounded-lg border border-dashed border-vui-border bg-vui-surface-muted px-3 py-2 text-[13px] text-vui-muted">
        {{ lane.title }}
      </div>
    }

    <!-- Above the graph: a note that follows the node it points at. -->
    <p *vPortal="notePoint()" class="m-0 w-45 text-[13px] leading-5 text-vui-muted">
      ↙ Drag “Payment”: this note is not a node, it follows the node’s rectangle.
    </p>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class PortalDemoComponent {
  private readonly flow = viewChild.required(VflowComponent);

  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 40, y: 50 }, data: { text: 'Order' } },
    { id: 'payment', point: { x: 220, y: 50 }, data: { text: 'Payment' } },
    { id: 'picking', point: { x: 400, y: 210 }, data: { text: 'Picking' } },
    { id: 'shipping', point: { x: 580, y: 210 }, data: { text: 'Shipping' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'order-payment', source: 'order', target: 'payment' },
    { id: 'payment-picking', source: 'payment', target: 'picking' },
    { id: 'picking-shipping', source: 'picking', target: 'shipping' },
  ]);

  protected readonly lanes: readonly Lane[] = [
    { title: 'Sales', point: { x: 0, y: 0 } },
    { title: 'Warehouse', point: { x: 0, y: 160 } },
  ];

  /** Above and to the right of the node; nothing renders until the node is measured. */
  protected readonly notePoint = computed(() => {
    const rect = this.flow().getNodeRect('payment');
    return rect && { x: rect.x + rect.width + 16, y: rect.y - 44 };
  });
}
