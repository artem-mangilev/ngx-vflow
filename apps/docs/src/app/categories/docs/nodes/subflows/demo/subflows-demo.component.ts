import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <ng-template let-ctx vNode>
      @if (ctx.data().type === 'group') {
        <section vuiGroup class="text-[13px]" [style.width.px]="ctx.width()" [style.height.px]="ctx.height()">
          <header vuiGroupHeader>
            <span vuiTitle>{{ ctx.data().text }}</span>
          </header>
          <!-- A parent node draws handles like any other node. -->
          <span vuiPort handleType="source" position="right"></span>
        </section>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class SubflowsDemoComponent {
  // The point of a child is relative to its parent.
  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 0 }, width: 320, height: 270, data: { type: 'group', text: 'Order' } },
    { id: 'validate', point: { x: 40, y: 57 }, parentId: 'order', data: { text: 'Validate' } },
    { id: 'charge', point: { x: 180, y: 57 }, parentId: 'order', data: { text: 'Charge' } },
    {
      id: 'delivery',
      point: { x: 20, y: 127 },
      width: 280,
      height: 123,
      parentId: 'order',
      data: { type: 'group', text: 'Delivery' },
    },
    { id: 'pack', point: { x: 20, y: 53 }, parentId: 'delivery', data: { text: 'Pack' } },
    { id: 'ship', point: { x: 160, y: 53 }, parentId: 'delivery', data: { text: 'Ship' } },
    { id: 'receipt', point: { x: 400, y: 110 }, data: { text: 'Receipt' } },
    { id: 'tracking', point: { x: 400, y: 190 }, data: { text: 'Tracking' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'validate-charge', source: 'validate', target: 'charge' },
    { id: 'pack-ship', source: 'pack', target: 'ship' },
    // The edges of a group start at the handle the group draws.
    { id: 'order-receipt', source: 'order', target: 'receipt' },
    { id: 'delivery-tracking', source: 'delivery', target: 'tracking' },
  ]);
}
