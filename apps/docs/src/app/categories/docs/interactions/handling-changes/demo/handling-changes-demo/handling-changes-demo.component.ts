import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Connection, Edge, EdgeChange, NodeChange, Vflow, createEdge, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Drag a node, connect two ports, click a node or an edge. A row shows the last array its output emitted.</p>
    </div>

    <div class="flex h-full flex-col">
      <div class="min-h-0 flex-1">
        <vflow
          #flow
          [nodes]="nodes"
          [edges]="edges()"
          (initialized)="flow.fitView({ maxZoom: 1 })"
          (connect)="connect($event)"
          (nodesChanges)="handleNodeChanges($event)"
          (edgesChanges)="handleEdgeChanges($event)">
          <docs-node *vNode="let ctx" [ctx]="ctx" />
          <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
        </vflow>
      </div>

      <dl
        class="border-vui-border m-0 grid grid-cols-[max-content_1fr] items-baseline gap-x-3.5 gap-y-1.5 border-t p-3.5 text-[13px] leading-5">
        <dt class="text-vui-muted font-mono text-xs/5">(nodesChanges)</dt>
        <dd class="m-0 min-w-0 truncate">{{ nodeChanges() }}</dd>
        <dt class="text-vui-muted font-mono text-xs/5">(edgesChanges)</dt>
        <dd class="m-0 min-w-0 truncate" data-testid="edge-changes">{{ edgeChanges() }}</dd>
      </dl>
    </div>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class HandlingChangesDemoComponent {
  protected readonly nodeChanges = signal('nothing yet');
  protected readonly edgeChanges = signal('nothing yet');

  protected readonly nodes = createNodes([
    { id: 'draft', point: { x: 0, y: 0 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 180, y: 0 }, data: { text: 'Review' } },
    { id: 'published', point: { x: 360, y: 0 }, data: { text: 'Published' } },
  ]);

  protected readonly edges = signal<Edge[]>(
    createEdges([
      { id: 'draft-review', source: 'draft', target: 'review' },
      { id: 'review-published', source: 'review', target: 'published' },
    ]),
  );

  protected connect({ source, target }: Connection): void {
    this.edges.update((edges) => [...edges, createEdge({ id: `${source}-${target}`, source, target })]);
  }

  // One array carries every change of a tick: drag two selected nodes and it holds two `position` changes.
  protected handleNodeChanges(changes: NodeChange[]): void {
    this.nodeChanges.set(changes.map(describe).join('; '));
  }

  protected handleEdgeChanges(changes: EdgeChange[]): void {
    this.edgeChanges.set(changes.map(describe).join('; '));
  }
}

/** A change names the node or the edge by `id` and reports what has already happened to it. */
function describe(change: NodeChange | EdgeChange): string {
  switch (change.type) {
    case 'position':
      return `${change.id} moved to ${Math.round(change.point.x)}, ${Math.round(change.point.y)}`;
    case 'size':
      return `${change.id} measured ${Math.round(change.size.width)} × ${Math.round(change.size.height)}`;
    case 'select':
      return `${change.id} ${change.selected ? 'selected' : 'deselected'}`;
    case 'detached':
      return `${change.id} detached`;
  }
}
