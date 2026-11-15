import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  Connection,
  Edge,
  EdgeSelectedChange,
  NodePositionChange,
  NodeSelectedChange,
  Vflow,
  createEdge,
  createNodes,
} from 'ngx-vflow';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p>Drag a node, connect two ports, click a node or an edge. A row follows one type of change only.</p>
    </div>

    <div class="flex h-full flex-col">
      <div class="min-h-0 flex-1">
        <vflow
          #flow
          [nodes]="nodes"
          [edges]="edges()"
          (initialized)="flow.fitView({ maxZoom: 1 })"
          (connect)="connect($event)"
          (nodesChanges.position)="handleNodePositions($event)"
          (nodesChanges.select)="handleNodeSelection($event)"
          (edgesChanges.select)="handleEdgeSelection($event)">
          <docs-node *vNode="let ctx" [ctx]="ctx" />
          <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
        </vflow>
      </div>

      <dl
        class="border-vui-border m-0 grid grid-cols-[max-content_1fr] items-baseline gap-x-3.5 gap-y-1.5 border-t p-3.5 text-[13px] leading-5">
        <dt class="text-vui-muted font-mono text-xs/5">(nodesChanges.position)</dt>
        <dd class="m-0 min-w-0 truncate">{{ nodePositions() }}</dd>
        <dt class="text-vui-muted font-mono text-xs/5">(nodesChanges.select)</dt>
        <dd class="m-0 min-w-0 truncate">{{ nodeSelection() }}</dd>
        <dt class="text-vui-muted font-mono text-xs/5">(edgesChanges.select)</dt>
        <dd class="m-0 min-w-0 truncate">{{ edgeSelection() }}</dd>
      </dl>
    </div>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class HandlingChangesFilteredDemoComponent {
  protected readonly nodePositions = signal('nothing yet');
  protected readonly nodeSelection = signal('nothing yet');
  protected readonly edgeSelection = signal('nothing yet');

  protected readonly nodes = createNodes([
    { id: 'draft', point: { x: 0, y: 0 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 180, y: 0 }, data: { text: 'Review' } },
    { id: 'published', point: { x: 360, y: 0 }, data: { text: 'Published' } },
  ]);

  protected readonly edges = signal<Edge[]>([]);

  protected connect({ source, target }: Connection): void {
    this.edges.update((edges) => [...edges, createEdge({ id: `${source}-${target}`, source, target })]);
  }

  // Each handler receives changes of one type, so it reads their fields without narrowing.
  protected handleNodePositions(changes: NodePositionChange[]): void {
    this.nodePositions.set(
      changes.map(({ id, point }) => `${id} moved to ${Math.round(point.x)}, ${Math.round(point.y)}`).join('; '),
    );
  }

  protected handleNodeSelection(changes: NodeSelectedChange[]): void {
    this.nodeSelection.set(describeSelection(changes));
  }

  protected handleEdgeSelection(changes: EdgeSelectedChange[]): void {
    this.edgeSelection.set(describeSelection(changes));
  }
}

function describeSelection(changes: (NodeSelectedChange | EdgeSelectedChange)[]): string {
  return changes.map(({ id, selected }) => `${id} ${selected ? 'selected' : 'deselected'}`).join('; ');
}
