import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  Node,
  StaticEdge,
  StaticNode,
  Vflow,
  addEdges,
  addNodes,
  createEdges,
  createNodes,
  toStaticEdges,
  toStaticNodes,
} from 'ngx-vflow';

/** How far each paste lands from the copied nodes, in flow units. */
const OFFSET = 40;

@Component({
  template: `<docs-demo (keydown)="shortcut($event)">
    <div docsDemoBar>
      <button docsButton type="button" (click)="copy()">Copy</button>
      <button docsButton type="button" [disabled]="!clipboard()" (click)="paste()">Paste</button>
      <button docsButton type="button" (click)="copy() && paste()">Duplicate</button>
      <p aria-live="polite">{{ status() }}</p>
    </div>

    <vflow #flow [nodes]="nodes()" [edges]="edges()" (initialized)="flow.fitView({ maxZoom: 1 })">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class CopyPasteDemoComponent {
  protected readonly nodes = signal<Node[]>(
    createNodes([
      { id: 'fetch', point: { x: 0, y: 40 }, data: { text: 'Fetch' } },
      { id: 'parse', point: { x: 180, y: 0 }, data: { text: 'Parse' }, selected: true },
      { id: 'store', point: { x: 360, y: 40 }, data: { text: 'Store' }, selected: true },
    ]),
  );
  protected readonly edges = signal(
    createEdges([
      { id: 'fetch-parse', source: 'fetch', target: 'parse' },
      { id: 'parse-store', source: 'parse', target: 'store' },
    ]),
  );

  /** The copied nodes and the edges between them, as plain values. */
  protected readonly clipboard = signal<{ nodes: StaticNode[]; edges: StaticEdge[] } | null>(null);
  protected readonly status = signal('Select nodes, then copy and paste them, or press Mod+C and Mod+V.');
  private pastes = 0;

  protected copy(): boolean {
    const nodes = this.nodes().filter((node) => node.selected?.());
    if (!nodes.length) {
      this.status.set('Nothing is selected.');
      return false;
    }

    const ids = new Set(nodes.map((node) => node.id));
    // An edge goes along only when both of its ends are copied.
    const edges = this.edges().filter((edge) => ids.has(edge.source) && ids.has(edge.target));

    this.clipboard.set({ nodes: toStaticNodes(nodes), edges: toStaticEdges(edges) });
    this.pastes = 0;
    this.status.set(`Copied ${nodes.length} node${nodes.length === 1 ? '' : 's'}.`);
    return true;
  }

  protected paste(): void {
    const clipboard = this.clipboard();
    if (!clipboard) return;

    // Every paste lands a step further, so repeated pastes do not stack on one spot.
    const offset = OFFSET * ++this.pastes;
    const ids = new Map(clipboard.nodes.map((node) => [node.id, crypto.randomUUID()]));

    // The pasted nodes become the selection, so the next copy or move takes them.
    this.nodes().forEach((node) => node.selected?.set(false));
    this.edges().forEach((edge) => edge.selected.set(false));

    const nodes = createNodes(
      clipboard.nodes.map((node) => ({
        ...node,
        id: ids.get(node.id)!,
        point: { x: node.point.x + offset, y: node.point.y + offset },
        selected: true,
      })),
    );
    const edges = createEdges(
      clipboard.edges.map((edge) => ({
        ...edge,
        id: crypto.randomUUID(),
        source: ids.get(edge.source)!,
        target: ids.get(edge.target)!,
        selected: false,
      })),
    );

    this.nodes.update((existing) => addNodes(nodes, existing));
    this.edges.update((existing) => addEdges(edges, { nodes: this.nodes(), edges: existing }));
    this.status.set(`Pasted ${nodes.length} node${nodes.length === 1 ? '' : 's'}.`);
  }

  protected shortcut(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

    const key = event.key.toLowerCase();
    if (key === 'c') this.copy();
    else if (key === 'v') this.paste();
    else if (key === 'd') this.copy() && this.paste();
    else return;

    event.preventDefault();
  }
}
