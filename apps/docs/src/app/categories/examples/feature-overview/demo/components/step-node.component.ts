import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { DemoIconComponent, DemoIconName, DocsButton, DocsNodeIcon, DocsSelect } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { HandleType, Position, Vflow, injectNode } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

export interface StepData {
  title: string;
  meta: string;
  kind: 'trigger' | 'action' | 'notice';
  icon: DemoIconName;
  /** A port has an id when the step has another port of the same type; the edges name it as their handle. */
  ports: { type: HandleType; position: Position; id?: string }[];
  /** Ways to send a notice; the step shows a list of them, and `channel` is the one chosen. */
  channels?: string[];
  channel?: string;
}

/** The color of the icon says what kind of step it is. */
const KINDS: Record<StepData['kind'], string> = {
  trigger: '[--icon-color:var(--color-violet-500)]',
  action: '[--icon-color:var(--color-teal-600)]',
  notice: '[--icon-color:var(--color-amber-500)]',
};

/**
 * A step of the workflow. While it is selected it shows its toolbar. Its ports come from its data, each on the side
 * the data names.
 */
@Component({
  template: `
    @let step = ctx.data();

    <article vuiNode class="flex w-50 flex-col text-[13px]">
      <div class="flex flex-1 items-center gap-vui-2 p-vui-3">
        <span docsNodeIcon tile [class]="kinds[step.kind]"><app-demo-icon [name]="step.icon" /></span>
        <div class="min-w-0">
          <div vuiTitle>{{ step.title }}</div>
          <div vuiMeta>{{ step.meta }}</div>
        </div>
      </div>

      @if (step.channels; as channels) {
        <!-- A control inside a node: a press on it neither drags nor selects the node. -->
        <label class="flex items-center gap-vui-2 border-t border-vui-separator px-vui-3 py-vui-2">
          Send by
          <select docsSelect vNoDrag vNoSelect class="ms-auto" (change)="setChannel($event)">
            @for (channel of channels; track channel) {
              <option [selected]="channel === step.channel">{{ channel }}</option>
            }
          </select>
        </label>
      }

      @for (port of step.ports; track port) {
        <span
          vuiPort
          [handleType]="port.type"
          [position]="port.position"
          [handleId]="port.id"
          [vuiPortConnected]="connected().has(port.type + ':' + port.id)"></span>
      }
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
  // The card is the element the flow measures, so the host adds no box of its own.
  host: { class: 'contents' },
  imports: [Vflow, Vui, DocsButton, DocsSelect, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepNodeComponent {
  protected readonly ctx = injectNode<StepData>();
  private readonly store = inject(FlowStoreService);

  protected readonly kinds = KINDS;

  /** The ports an edge starts from or ends on, as `type:id`: they are filled. */
  protected readonly connected = computed(() => {
    const ports = new Set<string>();

    for (const edge of this.store.edges()) {
      if (edge.source === this.ctx.node.id) ports.add(`source:${edge.sourceHandle}`);
      if (edge.target === this.ctx.node.id) ports.add(`target:${edge.targetHandle}`);
    }

    return ports;
  });

  // Both reach the flow as a `componentNodeEvent`, which carries the id of this node.
  readonly duplicated = output<void>();
  readonly deleted = output<void>();

  /** The data of a node is a signal, so the node writes its own data. */
  protected setChannel(event: Event): void {
    const channel = (event.target as HTMLSelectElement).value;

    this.ctx.node.data?.update((step) => ({ ...step, channel }));
  }
}
