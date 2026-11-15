import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { DocsKit } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

export interface ApprovalData {
  approver: string;
}

export type Decision = 'approved' | 'rejected';

/** The step where a person decides on the request. */
@Component({
  template: `
    <article vuiNode class="w-52 text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>Approval</span>
        <span vuiMeta>{{ node.data().approver }}</span>
      </header>
      <footer vuiNodeFooter>
        <button docsButton small type="button" vNoDrag (click)="decided.emit('approved')">Approve</button>
        <button docsButton="plain" small type="button" vNoDrag (click)="decided.emit('rejected')">Reject</button>
      </footer>
      <span vuiPort handleType="target" position="left"></span>
    </article>
  `,
  imports: [Vflow, Vui, DocsKit],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalNodeComponent {
  protected readonly node = injectNode<ApprovalData>();

  readonly decided = output<Decision>();
}
