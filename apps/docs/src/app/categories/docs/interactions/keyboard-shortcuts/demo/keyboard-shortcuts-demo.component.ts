import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes, provideVflow, withShortcuts } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Hold Alt and drag over the canvas to draw a selection box; hold Shift and click to add to the selection.</p>
    </div>

    <vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
  // Only the named entries change; every other shortcut keeps its default.
  providers: [provideVflow(withShortcuts({ modifiers: { selection: ['Alt'], multiSelection: ['Shift'] } }))],
})
export class KeyboardShortcutsDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'request', point: { x: 0, y: 50 }, data: { text: 'Request' } },
    { id: 'review', point: { x: 180, y: 50 }, data: { text: 'Review' } },
    { id: 'approved', point: { x: 360, y: 0 }, data: { text: 'Approved' } },
    { id: 'rejected', point: { x: 360, y: 100 }, data: { text: 'Rejected' } },
  ]);

  protected readonly edges = createEdges([
    { id: 'request-review', source: 'request', target: 'review' },
    { id: 'review-approved', source: 'review', target: 'approved' },
    { id: 'review-rejected', source: 'review', target: 'rejected' },
  ]);
}
