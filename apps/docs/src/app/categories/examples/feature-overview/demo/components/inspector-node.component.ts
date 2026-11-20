import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { injectNode } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

type Metric = 'width' | 'height' | 'x' | 'y';

export interface InspectorData {
  title: string;
  /** The values of the connected node to show, one per row. */
  rows: Metric[];
}

const LABELS: Record<Metric, string> = { width: 'W', height: 'H', x: 'X', y: 'Y' };

/**
 * Shows the size or the position of the node wired into it, so the values follow a drag and a resize of that node,
 * and change when the edge is dragged to another node.
 */
@Component({
  template: `
    <article vuiNode class="w-40 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-slate-500)]"><app-demo-icon name="search" /></span>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>
      @for (row of rows(); track row.metric) {
        <div vuiRow>
          <span vuiMeta>{{ row.label }}:</span>
          <span class="ms-auto tabular-nums">{{ row.value }}</span>
        </div>
      }
      <span vuiPort handleType="target" position="top" [vuiPortConnected]="!!source()"></span>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vui, DocsNodeIcon, DemoIconComponent],
})
export class InspectorNodeComponent {
  protected readonly ctx = injectNode<InspectorData>();
  private readonly store = inject(FlowStoreService);

  /** The node at the other end of the edge that ends here; the flow lets only one edge in. */
  protected readonly source = computed(() => {
    const edge = this.store.edges().find((edge) => edge.target === this.ctx.node.id);

    return edge && this.store.nodes().find((node) => node.id === edge.source);
  });

  protected readonly rows = computed(() =>
    this.ctx.data().rows.map((metric) => ({ metric, label: LABELS[metric], value: this.read(metric) })),
  );

  /** A dash while nothing is connected, and for a size nobody has measured yet, as in a page rendered on a server. */
  private read(metric: Metric): string {
    const source = this.source();

    if (!source) return '–';

    if (metric === 'x' || metric === 'y') return `${Math.floor(source.point()[metric])}`;

    // A content-sized node has no size in its data; the flow reports measured and resized sizes as changes.
    const size = this.store.sizes()[source.id];

    return size ? `${Math.floor(size[metric])}px` : '–';
  }
}
