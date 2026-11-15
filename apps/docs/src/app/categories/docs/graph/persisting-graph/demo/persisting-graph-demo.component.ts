import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import {
  Edge,
  Node,
  StaticEdge,
  StaticNode,
  Vflow,
  createEdges,
  createNodes,
  toStaticEdges,
  toStaticNodes,
} from 'ngx-vflow';

const STORAGE_KEY = 'ngx-vflow-docs:persisted-graph';

interface Snapshot {
  nodes: StaticNode[];
  edges: StaticEdge[];
}

const INITIAL: Snapshot = {
  nodes: [
    { id: 'draft', point: { x: 40, y: 40 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 240, y: 130 }, data: { text: 'Review' } },
    { id: 'done', point: { x: 440, y: 40 }, data: { text: 'Done' } },
  ],
  edges: [
    { id: 'draft-review', source: 'draft', target: 'review', curve: 'smooth-step' },
    { id: 'review-done', source: 'review', target: 'done', curve: 'smooth-step' },
  ],
};

/** The graph is restored from `localStorage` when the demo loads, so a reload is the check that a save worked. */
@Component({
  imports: [DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .demo {
      container-type: inline-size;
    }
    /* Both columns have a fixed height and their own scrolling, so saving never moves the flow. */
    .pair {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      height: 300px;
    }
    .pair > * + * {
      border-left: 1px solid var(--vui-border);
    }
    @container (max-width: 560px) {
      .pair {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 1fr 1fr;
        height: 440px;
      }
      .pair > * + * {
        border-left: 0;
        border-top: 1px solid var(--vui-border);
      }
    }
    vflow {
      height: 100%;
    }
    pre {
      margin: 0;
      padding: 12px 14px;
      height: 100%;
      box-sizing: border-box;
      overflow: auto;
      font-size: 12px;
      color: var(--vui-muted);
    }
  `,
  template: `
    <section class="demo" data-testid="persisting-graph-demo">
      <div class="controls">
        <button class="button" type="button" (click)="save()">Save</button>
        <p>{{ status() }}</p>
      </div>
      <div class="pair">
        <vflow [nodes]="nodes()" [edges]="edges()">
          <docs-node *vNode="let ctx" [ctx]="ctx" />
          <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
        </vflow>
        <pre aria-label="Saved graph" data-testid="snapshot">{{ snapshot() || 'Nothing saved yet.' }}</pre>
      </div>
    </section>
  `,
})
export class PersistingGraphDemoComponent {
  private readonly saved = readStorage();

  protected readonly nodes = signal<Node[]>(createNodes(this.saved?.nodes ?? INITIAL.nodes));
  protected readonly edges = signal<Edge[]>(createEdges(this.saved?.edges ?? INITIAL.edges));
  protected readonly snapshot = signal(this.saved ? print(this.saved) : '');
  protected readonly status = signal(
    this.saved ? 'Restored from localStorage on load.' : 'Drag a node, save, then reload the page.',
  );

  protected save(): void {
    const snapshot: Snapshot = { nodes: toStaticNodes(this.nodes()), edges: toStaticEdges(this.edges()) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    this.snapshot.set(print(snapshot));
    this.status.set('Saved. Reload the page: the graph comes back as it is now.');
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
