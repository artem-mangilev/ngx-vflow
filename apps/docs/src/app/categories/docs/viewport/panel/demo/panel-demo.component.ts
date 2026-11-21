import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { PanelPosition, Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1, padding: 0.3 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />

    <vui-controls vPanel="bottom-left" />
    <v-minimap vPanel="bottom-right" class="rounded-lg border border-vui-border" />

    <!-- The position is an input: the button moves the legend to the next corner or side. -->
    <button
      type="button"
      vuiToolbar
      class="cursor-pointer border-0 px-3 py-1.5 text-[13px]"
      [vPanel]="position()"
      (click)="next()">
      {{ position() }}
    </button>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class PanelDemoComponent {
  private readonly positions: PanelPosition[] = ['top-left', 'top-center', 'top-right', 'center-right', 'center-left'];

  protected readonly position = signal<PanelPosition>('top-left');

  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 60 }, data: { text: 'Order' } },
    { id: 'payment', point: { x: 200, y: 0 }, data: { text: 'Payment' } },
    { id: 'stock', point: { x: 200, y: 120 }, data: { text: 'Stock check' } },
    { id: 'packing', point: { x: 400, y: 60 }, data: { text: 'Packing' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'order-payment', source: 'order', target: 'payment' },
    { id: 'order-stock', source: 'order', target: 'stock' },
    { id: 'payment-packing', source: 'payment', target: 'packing' },
    { id: 'stock-packing', source: 'stock', target: 'packing' },
  ]);

  protected next() {
    const index = this.positions.indexOf(this.position());
    this.position.set(this.positions[(index + 1) % this.positions.length]);
  }
}
