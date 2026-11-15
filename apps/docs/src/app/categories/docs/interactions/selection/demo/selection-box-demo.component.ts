import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { SelectionBoxMode, Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label>
        Mode
        <select docsSelect aria-label="Selection box mode" (change)="setMode($event)">
          <option value="full">full</option>
          <option value="partial">partial</option>
        </select>
      </label>
      <p>Hold Shift and drag a box over the nodes.</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges"
      [selectionBoxMode]="mode()"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class SelectionBoxDemoComponent {
  protected readonly mode = signal<SelectionBoxMode>('full');

  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 50 }, data: { text: 'Order' } },
    { id: 'payment', point: { x: 180, y: 50 }, data: { text: 'Payment' } },
    { id: 'shipping', point: { x: 360, y: 0 }, data: { text: 'Shipping' } },
    { id: 'invoice', point: { x: 360, y: 100 }, data: { text: 'Invoice' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'order-payment', source: 'order', target: 'payment' },
    { id: 'payment-shipping', source: 'payment', target: 'shipping' },
    { id: 'payment-invoice', source: 'payment', target: 'invoice' },
  ]);

  protected setMode(event: Event): void {
    this.mode.set((event.target as HTMLSelectElement).value as SelectionBoxMode);
  }
}
