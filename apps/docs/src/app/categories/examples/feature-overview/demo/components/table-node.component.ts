import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { injectNode } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

export interface TableData {
  fields: { name: string; type: string }[];
}

/**
 * A node with a port on every row. The port is declared inside its row, so it stays at the height of the row; the
 * name of the field is its `handleId`, which the edges refer to as `sourceHandle`.
 */
@Component({
  template: `
    <article vuiNode class="w-50 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-emerald-500)]"><app-demo-icon name="layers" /></span>
        <span vuiTitle>Ports on rows</span>
      </header>
      @for (field of ctx.data().fields; track field.name) {
        <div vuiRow>
          <span vuiTitle>{{ field.name }}</span>
          <span vuiMeta>{{ field.type }}</span>
          <span
            vuiPort
            handleType="source"
            position="right"
            [handleId]="field.name"
            [vuiPortConnected]="connected().has(field.name)"></span>
        </div>
      }
    </article>
  `,
  imports: [Vui, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableNodeComponent {
  protected readonly ctx = injectNode<TableData>();
  private readonly store = inject(FlowStoreService);

  /** The fields an edge starts from: their ports are filled. */
  protected readonly connected = computed(
    () =>
      new Set(
        this.store
          .edges()
          .filter((edge) => edge.source === this.ctx.node.id)
          .map((edge) => edge.sourceHandle),
      ),
  );
}
