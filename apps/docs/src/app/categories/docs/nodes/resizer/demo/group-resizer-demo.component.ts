import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <ng-template let-ctx vNode>
      @if (ctx.data().type === 'group') {
        <section vuiGroup vResizable class="min-w-40 min-h-24 text-[13px]">
          <header vuiGroupHeader>
            <span vuiTitle>{{ ctx.data().text }}</span>
            <!-- The rendered size, not the requested one of ctx.node.width and ctx.node.height. -->
            <span vuiMeta class="tabular-nums">
              {{ ctx.width() | number: '1.0-0' }} × {{ ctx.height() | number: '1.0-0' }}
            </span>
          </header>
        </section>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DocsPresentations, Vflow, Vui],
})
export class GroupResizerDemoComponent {
  protected readonly nodes = createNodes([
    // Both axes of the group start fixed.
    { id: 'checkout', point: { x: 0, y: 0 }, width: 300, height: 130, data: { type: 'group', text: 'Checkout' } },
    { id: 'cart', point: { x: 20, y: 58 }, parentId: 'checkout', data: { text: 'Cart' } },
    { id: 'payment', point: { x: 180, y: 58 }, parentId: 'checkout', data: { text: 'Payment' } },
  ]);

  protected readonly edges = createEdges([{ id: 'cart-payment', source: 'cart', target: 'payment' }]);
}
