import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

type GestureSetting = 'panOnDrag' | 'panOnScroll' | 'zoomOnScroll' | 'zoomOnPinch' | 'zoomOnDoubleClick';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      @for (setting of settings; track setting) {
        <label>
          <input type="checkbox" [checked]="enabled()[setting]" (change)="toggle(setting)" />
          {{ setting }}
        </label>
      }
      <button docsButton type="button" (click)="flow.fitView({ maxZoom: 1, duration: 500 })">Fit view</button>
      <!-- The readout changes on every frame of a gesture, which a screen reader must not announce. -->
      <output class="text-vui-muted tabular-nums" aria-live="off">
        x {{ flow.viewport().x | number: '1.0-0' }}, y {{ flow.viewport().y | number: '1.0-0' }}, zoom
        {{ flow.viewport().zoom | number: '1.2-2' }}
      </output>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges"
      [background]="{ type: 'dots' }"
      [panOnDrag]="enabled().panOnDrag"
      [panOnScroll]="enabled().panOnScroll"
      [zoomOnScroll]="enabled().zoomOnScroll"
      [zoomOnPinch]="enabled().zoomOnPinch"
      [zoomOnDoubleClick]="enabled().zoomOnDoubleClick"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, DecimalPipe],
})
export class ViewportGesturesDemoComponent {
  protected readonly settings: GestureSetting[] = [
    'panOnDrag',
    'panOnScroll',
    'zoomOnScroll',
    'zoomOnPinch',
    'zoomOnDoubleClick',
  ];

  protected readonly enabled = signal<Record<GestureSetting, boolean>>({
    panOnDrag: true,
    panOnScroll: false,
    zoomOnScroll: true,
    zoomOnPinch: true,
    zoomOnDoubleClick: true,
  });

  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 45 }, data: { text: 'Order' } },
    { id: 'payment', point: { x: 180, y: 0 }, data: { text: 'Payment' } },
    { id: 'packing', point: { x: 180, y: 90 }, data: { text: 'Packing' } },
    { id: 'shipping', point: { x: 360, y: 45 }, data: { text: 'Shipping' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'order-payment', source: 'order', target: 'payment' },
    { id: 'order-packing', source: 'order', target: 'packing' },
    { id: 'payment-shipping', source: 'payment', target: 'shipping' },
    { id: 'packing-shipping', source: 'packing', target: 'shipping' },
  ]);

  protected toggle(setting: GestureSetting): void {
    this.enabled.update((enabled) => ({ ...enabled, [setting]: !enabled[setting] }));
  }
}
