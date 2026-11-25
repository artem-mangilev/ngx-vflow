import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';

/** Stands in for a node that brings a data grid with it. */
@Component({
  template: `
    <article vuiNode class="flex h-38 w-56 flex-col text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>Orders</span>
        <span vuiMeta>Table</span>
      </header>
      @for (order of orders; track order.id) {
        <div vuiRow>
          <span vuiTitle>{{ order.id }}</span>
          <span vuiMeta>{{ order.customer }}</span>
          <span class="tabular-nums">{{ order.total }}</span>
        </div>
      }
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersTableNodeComponent {
  protected readonly orders = [
    { id: '#1042', customer: 'Northwind', total: '$480' },
    { id: '#1043', customer: 'Contoso', total: '$1,250' },
    { id: '#1044', customer: 'Fabrikam', total: '$96' },
  ];
}
