import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';

/** Stands in for a node that brings a charting library with it: code worth fetching only when the node is seen. */
@Component({
  template: `
    <article vuiNode class="flex h-38 w-56 flex-col text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>Revenue</span>
        <span vuiMeta>Chart</span>
      </header>
      <svg class="fill-vui-accent p-vui-3 block min-h-0 flex-1" viewBox="0 0 200 64" aria-hidden="true">
        @for (height of months; track $index) {
          <rect width="20" rx="2" [attr.x]="$index * 30" [attr.y]="64 - height" [attr.height]="height" />
        }
      </svg>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueChartNodeComponent {
  protected readonly months = [22, 30, 26, 41, 48, 44, 64];
}
