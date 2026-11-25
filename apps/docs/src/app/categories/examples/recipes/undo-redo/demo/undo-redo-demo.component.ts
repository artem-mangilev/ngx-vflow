import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  Connection,
  DeleteRequest,
  Edge,
  StaticEdge,
  StaticNode,
  Vflow,
  addEdges,
  createEdges,
  createNodes,
  removeElements,
  toStaticEdges,
  toStaticNodes,
} from 'ngx-vflow';

/** The graph as plain values: a node holds signals that change in place, so history keeps copies. */
interface Snapshot {
  nodes: StaticNode[];
  edges: StaticEdge[];
}

@Component({
  template: `<docs-demo (keydown)="shortcut($event)">
    <div docsDemoBar>
      <button docsButton type="button" [disabled]="!past().length" (click)="undo()">Undo</button>
      <button docsButton type="button" [disabled]="!future().length" (click)="redo()">Redo</button>
      <p aria-live="polite">{{ status() }}</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes()"
      [edges]="edges()"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (nodeDragStart)="record('Move')"
      (connect)="connect($event)"
      (deleteRequest)="remove($event)">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class UndoRedoDemoComponent {
  protected readonly nodes = signal(createNodes(INITIAL.nodes));
  protected readonly edges = signal<Edge[]>(createEdges(INITIAL.edges));

  /** Each entry is the graph before a change, with the name of the change. */
  protected readonly past = signal<{ label: string; graph: Snapshot }[]>([]);
  protected readonly future = signal<{ label: string; graph: Snapshot }[]>([]);

  protected readonly status = computed(() => {
    const last = this.past().at(-1);
    return last ? `${this.past().length} in history, last: ${last.label}` : 'Move, connect or delete, then undo.';
  });

  /** Keeps the graph as it is before a change; a new change drops what was undone. */
  protected record(label: string): void {
    this.past.update((past) => [...past, { label, graph: this.snapshot() }]);
    this.future.set([]);
  }

  protected connect(connection: Connection): void {
    this.record('Connect');
    this.edges.update((edges) =>
      addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes(), edges }),
    );
  }

  protected remove(request: DeleteRequest): void {
    this.record('Delete');
    const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }

  protected undo(): void {
    const entry = this.past().at(-1);
    if (!entry) return;

    this.future.update((future) => [{ label: entry.label, graph: this.snapshot() }, ...future]);
    this.past.update((past) => past.slice(0, -1));
    this.restore(entry.graph);
  }

  protected redo(): void {
    const [entry] = this.future();
    if (!entry) return;

    this.past.update((past) => [...past, { label: entry.label, graph: this.snapshot() }]);
    this.future.update((future) => future.slice(1));
    this.restore(entry.graph);
  }

  protected shortcut(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

    event.preventDefault();
    if (event.shiftKey) this.redo();
    else this.undo();
  }

  private snapshot(): Snapshot {
    return { nodes: toStaticNodes(this.nodes()), edges: toStaticEdges(this.edges()) };
  }

  /**
   * Writes the copy back into the nodes and edges that still exist and creates only the missing ones, so the views of
   * the others stay, and with them the focus a keyboard user had.
   */
  private restore(graph: Snapshot): void {
    const nodes = new Map(this.nodes().map((node) => [node.id, node]));
    const edges = new Map(this.edges().map((edge) => [edge.id, edge]));

    this.nodes.set(
      graph.nodes.map((saved) => {
        const node = nodes.get(saved.id);
        if (!node) return createNodes([saved])[0];

        node.point.set(saved.point);
        node.data.set(saved.data);
        node.selected.set(saved.selected ?? false);
        return node;
      }),
    );
    this.edges.set(
      graph.edges.map((saved) => {
        const edge = edges.get(saved.id);
        if (!edge) return createEdges([saved])[0];

        edge.selected?.set(saved.selected ?? false);
        return edge;
      }),
    );
  }
}

const INITIAL: Snapshot = {
  nodes: [
    { id: 'draft', point: { x: 0, y: 60 }, data: { text: 'Draft' } },
    { id: 'review', point: { x: 200, y: 0 }, data: { text: 'Review' } },
    { id: 'publish', point: { x: 400, y: 60 }, data: { text: 'Publish' } },
    { id: 'archive', point: { x: 200, y: 130 }, data: { text: 'Archive' } },
  ],
  edges: [
    { id: 'draft-review', source: 'draft', target: 'review' },
    { id: 'review-publish', source: 'review', target: 'publish' },
  ],
};
