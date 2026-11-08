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

const INITIAL: { nodes: StaticNode[]; edges: StaticEdge[] } = {
  nodes: [
    { id: 'draft', point: { x: 40, y: 40 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 280, y: 120 }, data: { text: 'Review' } },
    { id: 'done', point: { x: 520, y: 40 }, data: { text: 'Done' } },
  ],
  edges: [
    { id: 'draft-review', source: 'draft', target: 'review', curve: 'smooth-step' },
    { id: 'review-done', source: 'review', target: 'done', curve: 'smooth-step' },
  ],
};

@Component({
  imports: [DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    vflow {
      height: 260px;
    }
    pre {
      margin: 0;
      padding: 12px 14px;
      border-top: 1px solid var(--vui-border);
      font-size: 12px;
      max-height: 180px;
      overflow: auto;
    }
  `,
  template: `
    <section class="demo" data-testid="persisting-graph-demo">
      <div class="controls">
        <button class="button" type="button" (click)="save()">Save</button>
        <button class="button" type="button" (click)="restore()">Restore</button>
        <button class="button" type="button" (click)="reset()">Reset</button>
        <p>{{ status() }}</p>
      </div>
      <vflow [nodes]="nodes()" [edges]="edges()">
        <docs-node *vNode="let ctx" [ctx]="ctx" />
        <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
      </vflow>
      <pre aria-label="Saved graph" data-testid="snapshot">{{ snapshot() || 'Nothing saved yet.' }}</pre>
    </section>
  `,
})
export class PersistingGraphDemoComponent {
  protected readonly nodes = signal<Node[]>(createNodes(INITIAL.nodes));
  protected readonly edges = signal<Edge[]>(createEdges(INITIAL.edges));
  protected readonly snapshot = signal(readStorage() ?? '');
  protected readonly status = signal(
    readStorage() ? 'A saved graph is waiting in localStorage.' : 'Drag a node, then save.',
  );

  protected save(): void {
    const text = JSON.stringify({ nodes: toStaticNodes(this.nodes()), edges: toStaticEdges(this.edges()) }, null, 2);
    localStorage.setItem(STORAGE_KEY, text);
    this.snapshot.set(text);
    this.status.set('Saved. Reload the page and restore.');
  }

  protected restore(): void {
    const text = readStorage();
    if (!text) {
      this.status.set('Nothing to restore.');
      return;
    }
    const { nodes, edges } = JSON.parse(text) as { nodes: StaticNode[]; edges: StaticEdge[] };
    this.nodes.set(createNodes(nodes));
    this.edges.set(createEdges(edges));
    this.status.set('Restored from localStorage.');
  }

  protected reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.nodes.set(createNodes(INITIAL.nodes));
    this.edges.set(createEdges(INITIAL.edges));
    this.snapshot.set('');
    this.status.set('Back to the initial graph.');
  }
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
