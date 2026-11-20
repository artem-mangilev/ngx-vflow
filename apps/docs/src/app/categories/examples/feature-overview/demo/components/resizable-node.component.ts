import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { DemoIconComponent, DocsButton, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

/**
 * A node that shows its resize controls and its toolbar while it is selected. The resizer stops at the `min-*` CSS
 * of the card, 220 by 200px, which is the room its content needs.
 *
 * Its ports are declared inside the blocks they belong to: the input stays at the height of its block on the left
 * side, the output sits on the bottom side.
 */
@Component({
  template: `
    <article
      vuiNode
      class="flex min-h-50 w-55 min-w-55 flex-col text-[13px]"
      data-testid="resizable"
      [vResizable]="ctx.selected()">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-amber-500)]"><app-demo-icon name="sliders" /></span>
        <span vuiTitle>Resizer and toolbar</span>
      </header>
      <div class="flex flex-1 flex-col justify-between gap-vui-2 p-vui-3">
        <div vuiMeta>Select the node to show them</div>
        <div class="rounded-vui-control bg-vui-surface-muted px-vui-3 py-vui-2">
          <div vuiMeta>Input</div>
          {{ inputs() }}
          <span
            vuiPort
            handleType="target"
            position="left"
            handleId="input"
            [vuiPortConnected]="incoming().length > 0"></span>
        </div>
        <div class="rounded-vui-control bg-vui-surface-muted px-vui-3 py-vui-2">
          <div vuiMeta>Output</div>
          {{ outputs() }}
          <span
            vuiPort
            handleType="source"
            position="bottom"
            handleId="output"
            [vuiPortConnected]="outgoing() > 0"></span>
        </div>
      </div>
    </article>

    @if (ctx.selected()) {
      <v-node-toolbar position="top">
        <div vuiToolbar>
          <button docsButton="plain" small type="button" vNoSelect (click)="duplicated.emit()">Duplicate</button>
          <button docsButton="plain" small type="button" vNoSelect (click)="deleted.emit()">Delete</button>
        </div>
      </v-node-toolbar>
    }
  `,
  // The card is the element the flow measures and resizes, so the host adds no box of its own.
  host: { class: 'contents' },
  imports: [Vflow, Vui, DocsButton, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableNodeComponent {
  protected readonly ctx = injectNode();
  private readonly store = inject(FlowStoreService);

  /** The ports the edges into this node start from; for the table they are the names of its fields. */
  protected readonly incoming = computed(() =>
    this.store
      .edges()
      .filter((edge) => edge.target === this.ctx.node.id)
      .map((edge) => edge.sourceHandle ?? edge.source),
  );
  protected readonly outgoing = computed(
    () => this.store.edges().filter((edge) => edge.source === this.ctx.node.id).length,
  );

  protected readonly inputs = computed(() => this.incoming().join(', ') || 'Nothing connected');
  protected readonly outputs = computed(() => {
    const count = this.outgoing();

    return count ? `${count} ${count === 1 ? 'connection' : 'connections'}` : 'Nothing connected';
  });

  // Both reach the flow as a `componentNodeEvent`, which carries the id of this node.
  readonly duplicated = output<void>();
  readonly deleted = output<void>();
}
