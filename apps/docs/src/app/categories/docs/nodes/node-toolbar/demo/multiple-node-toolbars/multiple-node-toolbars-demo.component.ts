import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsBadgeTone, DocsKit } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Node, Vflow, createNodes } from 'ngx-vflow';

type Status = 'pending' | 'approved' | 'rejected';

interface RequestData {
  title: string;
  amount: string;
  status: Status;
}

@Component({
  template: `<vflow #flow [nodes]="nodes" (initialized)="flow.fitView({ maxZoom: 1 })">
    <article *vNode="let ctx of nodes" vuiNode class="w-52 text-[13px]">
      @let data = ctx.data();

      <header vuiNodeHeader>
        <span vuiTitle>{{ data.title }}</span>
        <span vuiMeta>{{ data.amount }}</span>
      </header>
      <div vuiRow>
        <span vuiMeta>Status</span>
        <span class="ms-auto capitalize" [docsBadge]="tones[data.status]">{{ data.status }}</span>
      </div>

      <v-node-toolbar position="top">
        <div vuiToolbar>
          <button docsButton="plain" small type="button" (click)="decide(ctx.node, 'approved')">Approve</button>
          <button docsButton="plain" small type="button" (click)="decide(ctx.node, 'rejected')">Reject</button>
        </div>
      </v-node-toolbar>

      <v-node-toolbar position="right">
        <div vuiToolbar>
          <button
            docsButton="plain"
            small
            type="button"
            [disabled]="data.status === 'pending'"
            (click)="decide(ctx.node, 'pending')">
            Reopen
          </button>
        </div>
      </v-node-toolbar>
    </article>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, Vflow, Vui],
})
export class MultipleNodeToolbarsDemoComponent {
  protected readonly tones: Record<Status, DocsBadgeTone> = {
    pending: 'neutral',
    approved: 'success',
    rejected: 'danger',
  };

  protected readonly nodes = createNodes<RequestData>([
    { id: 'request', point: { x: 0, y: 0 }, data: { title: 'Budget request', amount: '$4,800', status: 'pending' } },
  ]);

  protected decide(node: Node<RequestData>, status: Status): void {
    node.data?.update((data) => ({ ...data, status }));
  }
}
