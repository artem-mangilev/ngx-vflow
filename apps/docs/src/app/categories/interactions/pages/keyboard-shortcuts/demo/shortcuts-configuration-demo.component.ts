import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { DeleteRequest, KeyboardShortcuts, Vflow, createEdges, createNodes, removeEdges, removeNodes } from 'ngx-vflow';

/** The zoom defaults, repeated because an entry is replaced whole rather than extended. */
const ZOOM_DEFAULTS = {
  zoomIn: ['+', '=', 'NumpadAdd'],
  zoomOut: ['-', 'NumpadSubtract'],
  fitView: ['0', 'Numpad0'],
};

@Component({
  imports: [DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="shortcuts-demo" aria-label="Shortcut configuration example">
      <p>Tab into the graph, then press the keys below. Change a binding and the graph follows it at once.</p>
      <div class="controls">
        <label>
          Select with
          <select aria-label="Select command" (change)="select.set(chosen($event))">
            <option value="Enter,Space">Enter or Space</option>
            <option value="s">S</option>
          </select>
        </label>
        <label>
          Delete with
          <select aria-label="Delete command" (change)="remove.set(chosen($event))">
            <option value="Delete,Backspace">Delete or Backspace</option>
            <option value="x">X</option>
            <option value="">nothing</option>
          </select>
        </label>
        <label>
          <input type="checkbox" [checked]="zoom()" (change)="zoom.set(!zoom())" />
          Zoom and fit view
        </label>
      </div>
      <p>Deletion requests: {{ requests() }}. Nodes left: {{ nodes.length }}.</p>
      <pre tabindex="0" aria-label="Current shortcut configuration" data-testid="shortcuts-config">{{ printed() }}</pre>
      <vflow
        [nodes]="nodes"
        [edges]="edges"
        [view]="[600, 240]"
        [keyboardShortcuts]="shortcuts()"
        [ariaLabelConfig]="{ flowLabel: 'Configured graph' }"
        (deleteRequest)="onDeleteRequest($event)">
        <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
        <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
      </vflow>
    </section>
  `,
  styles: `
    section {
      background: white;
      color: #1b262c;
      padding: 12px;
      overflow: auto;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    pre {
      background: #f2f5f7;
      margin: 8px 0;
      padding: 8px;
      font-size: 12px;
      max-height: 150px;
      overflow: auto;
    }
  `,
})
export class ShortcutsConfigurationDemoComponent {
  protected select = signal('Enter,Space');
  protected remove = signal('Delete,Backspace');
  protected zoom = signal(true);
  protected requests = signal(0);

  protected shortcuts = computed<KeyboardShortcuts>(() => ({
    commands: {
      select: this.keys(this.select()),
      delete: this.keys(this.remove()),
      // Re-supplying the defaults is what turns the commands back on: an entry is replaced, never extended.
      ...(this.zoom() ? ZOOM_DEFAULTS : { zoomIn: [], zoomOut: [], fitView: [] }),
    },
  }));

  /** The object above as it would be written in code, which is what a reader copies. */
  protected printed = computed(() => {
    const entries = Object.entries(this.shortcuts().commands ?? {}).map(
      ([name, keys]) => `    ${name}: [${(keys ?? []).map((key) => `'${key}'`).join(', ')}],`,
    );
    return ['{', '  commands: {', ...entries, '  },', '}'].join('\n');
  });

  public nodes = createNodes([
    { id: 'draft', point: { x: 20, y: 30 }, data: { text: 'Draft' }, ariaLabel: 'Draft' },
    { id: 'review', point: { x: 230, y: 30 }, data: { text: 'Review' }, ariaLabel: 'Review' },
    { id: 'done', point: { x: 430, y: 30 }, data: { text: 'Done' }, ariaLabel: 'Done' },
  ]);
  public edges = createEdges([
    { id: 'to-review', source: 'draft', target: 'review', ariaLabel: 'To review' },
    { id: 'to-done', source: 'review', target: 'done', ariaLabel: 'To done' },
  ]);

  protected chosen(event: Event) {
    return (event.target as HTMLSelectElement).value;
  }

  protected keys(value: string) {
    return value ? value.split(',') : [];
  }

  protected onDeleteRequest({ nodeIds, edgeIds }: DeleteRequest) {
    this.requests.update((count) => count + 1);
    const result = removeNodes(nodeIds, { nodes: this.nodes, edges: removeEdges(edgeIds, this.edges) });
    this.nodes = result.nodes;
    this.edges = result.edges;
  }
}
