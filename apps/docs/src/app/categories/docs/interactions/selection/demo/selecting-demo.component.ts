import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <ng-template let-ctx vNode>
      @if (ctx.node.id === 'review') {
        <article vuiNode class="w-48 text-[13px]">
          <header vuiNodeHeader>
            <span vuiTitle>Review</span>
            <span vuiMeta>{{ ctx.selected() ? 'Selected' : 'Not selected' }}</span>
          </header>
          <footer vuiNodeFooter>
            <!-- vNoSelect: a click on the button approves and leaves the selection as it is. -->
            <button docsButton small type="button" vNoSelect vNoDrag (click)="approvals.set(approvals() + 1)">
              Approve
            </button>
            <span vuiMeta class="ms-auto">Approvals: {{ approvals() }}</span>
          </footer>
          <span vuiPort handleType="target" position="left"></span>
          <span vuiPort handleType="source" position="right"></span>
        </article>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
})
export class SelectingDemoComponent {
  protected readonly approvals = signal(0);

  protected readonly nodes = createNodes([
    { id: 'draft', point: { x: 0, y: 26 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 180, y: 0 }, data: { text: 'Review' } },
    { id: 'published', point: { x: 452, y: 26 }, data: { text: 'Published' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'draft-review', source: 'draft', target: 'review' },
    { id: 'review-published', source: 'review', target: 'published' },
  ]);
}
