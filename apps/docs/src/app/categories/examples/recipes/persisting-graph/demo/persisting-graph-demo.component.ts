import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { StaticEdge, StaticNode, Vflow, createEdges, createNodes, toStaticEdges, toStaticNodes } from 'ngx-vflow';

const STORAGE_KEY = 'ngx-vflow-docs:persisted-graph';

interface Snapshot {
  nodes: StaticNode[];
  edges: StaticEdge[];
}

const INITIAL: Snapshot = {
  nodes: [
    { id: 'draft', point: { x: 0, y: 0 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 150, y: 90 }, data: { text: 'Review' } },
    { id: 'published', point: { x: 300, y: 0 }, data: { text: 'Published' } },
  ],
  edges: [
    { id: 'draft-review', source: 'draft', target: 'review', curve: 'smooth-step' },
    { id: 'review-published', source: 'review', target: 'published', curve: 'smooth-step' },
  ],
};

/** The graph is restored from `localStorage` when the demo loads, so a reload is the check that a save worked. */
@Component({
  imports: [DocsKit, DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block size-full' },
  template: `
    <docs-demo data-testid="persisting-graph-demo">
      <div docsDemoBar>
        <button docsButton="primary" type="button" (click)="save()">Save</button>
        <button docsButton type="button" [disabled]="!snapshot()" (click)="clear()">Clear</button>
        <p aria-live="polite">{{ status() }}</p>
      </div>

      <!-- Both columns keep the height of the stage and scroll on their own, so saving never moves the flow. -->
      <div class="@container absolute inset-0">
        <div
          class="grid h-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @max-[560px]:grid-cols-1 @max-[560px]:grid-rows-2">
          <vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
            <docs-node *vNode="let ctx" [ctx]="ctx" />
            <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
          </vflow>
          <pre
            class="m-0 min-h-0 overflow-auto border-0 border-l border-solid border-vui-border p-3.5 font-doc-mono text-xs text-vui-muted @max-[560px]:border-t @max-[560px]:border-l-0"
            aria-label="Saved graph"
            data-testid="snapshot"
            >{{ snapshot() || 'Nothing saved yet.' }}</pre>
        </div>
      </div>
    </docs-demo>
  `,
})
export class PersistingGraphDemoComponent {
  private readonly saved = readStorage();

  protected readonly nodes = createNodes(this.saved?.nodes ?? INITIAL.nodes);
  protected readonly edges = createEdges(this.saved?.edges ?? INITIAL.edges);
  protected readonly snapshot = signal(this.saved ? print(this.saved) : '');
  protected readonly status = signal(
    this.saved ? 'Restored from localStorage on load.' : 'Drag a node, save, then reload the page.',
  );

  protected save(): void {
    const snapshot: Snapshot = { nodes: toStaticNodes(this.nodes), edges: toStaticEdges(this.edges) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    this.snapshot.set(print(snapshot));
    this.status.set('Saved. Reload the page: the graph comes back as it is now.');
  }

  /** Forgets the saved graph, so the next reload starts from the initial one. */
  protected clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.snapshot.set('');
    this.status.set('Nothing is saved now. Reload the page: the graph starts from its initial layout.');
  }
}

function print(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

function readStorage(): Snapshot | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return text ? (JSON.parse(text) as Snapshot) : null;
  } catch {
    return null;
  }
}
