import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { injectNode } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

type Metric = 'width' | 'height' | 'x' | 'y';

export interface OutputData {
  title: string;
  /** The values of the connected node to show, one per row. */
  rows: Metric[];
}

const LABELS: Record<Metric, string> = { width: 'W', height: 'H', x: 'X', y: 'Y' };

/** Shows the size or the position of the node connected to it, read from the store the demo provides. */
@Component({
  template: `
    <article vuiNode class="w-45 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-slate-500)]"><app-demo-icon name="download" /></span>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>
      @for (row of rows(); track row.metric) {
        <div vuiRow>
          <span vuiMeta>{{ row.label }}:</span>
          <span class="ms-auto tabular-nums">{{ row.value }}</span>
        </div>
      }
      <span vuiPort handleType="target" position="left"></span>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vui, DocsNodeIcon, DemoIconComponent],
})
export class OutputNodeComponent {
  protected readonly ctx = injectNode<OutputData>();
  private readonly store = inject(FlowStoreService);

  protected readonly rows = computed(() =>
    this.ctx.data().rows.map((metric) => ({ metric, label: LABELS[metric], value: this.read(metric) })),
  );

  /** A value of the node wired into this one; a dash while nothing is connected. */
  private read(metric: Metric): string {
    const edge = this.store.edges().find((edge) => edge.target === this.ctx.node.id);
    const source = this.store.nodes().find((node) => node.id === edge?.source);

    if (!source) return '–';

    if (metric === 'x' || metric === 'y') return `${Math.floor(source.point()[metric])}`;

    // A content-sized node has no size in its data; the flow reports measured and resized sizes as changes.
    return `${Math.floor(this.store.sizes()[source.id]?.[metric] ?? 0)}px`;
  }
}
