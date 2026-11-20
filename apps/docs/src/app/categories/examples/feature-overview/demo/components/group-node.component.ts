import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

export interface GroupData {
  title: string;
}

/**
 * A group is a node with a `width` and a `height` that other nodes name as their parent. Selected, it shows the
 * resize controls; the flow keeps the children inside while it shrinks.
 */
@Component({
  template: `
    <section vuiGroup class="text-[13px]" [vResizable]="ctx.selected()" [minWidth]="240" [minHeight]="120">
      <header vuiGroupHeader>
        <span vuiTitle>{{ ctx.data().title }}</span>
      </header>
    </section>
  `,
  // The section is the element the flow sizes, so the host adds no box of its own.
  host: { class: 'contents' },
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupNodeComponent {
  protected readonly ctx = injectNode<GroupData>();
}
