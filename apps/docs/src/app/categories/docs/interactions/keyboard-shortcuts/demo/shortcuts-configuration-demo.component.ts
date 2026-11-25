import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  DeleteRequest,
  KeyboardShortcuts,
  Vflow,
  createEdges,
  createNodes,
  provideVflow,
  removeElements,
  withAccessibility,
  withShortcuts,
} from 'ngx-vflow';

/** The zoom defaults, repeated because an entry is replaced whole rather than extended. */
const ZOOM_DEFAULTS = {
  zoomIn: ['+', '=', 'NumpadAdd'],
  zoomOut: ['-', 'NumpadSubtract'],
  fitView: ['0', 'Numpad0'],
};

@Component({
  template: `<docs-demo data-testid="shortcuts-demo">
    <div docsDemoBar>
      <label>
        Select with
        <select docsSelect aria-label="Select command" (change)="select.set(chosen($event))">
          <option value="Enter,Space">Enter or Space</option>
          <option value="s">S</option>
        </select>
      </label>
      <label>
        Delete with
        <select docsSelect aria-label="Delete command" (change)="remove.set(chosen($event))">
          <option value="Delete,Backspace">Delete or Backspace</option>
          <option value="x">X</option>
          <option value="">nothing</option>
        </select>
      </label>
      <label>
        <input type="checkbox" [checked]="zoom()" (change)="zoom.set(!zoom())" />
        Zoom and fit view
      </label>
      <p>Deletion requests: {{ requests() }}. Nodes left: {{ nodes().length }}.</p>
    </div>

    <!-- The flow and, beside it or under it on a narrow screen, the object the form provides. -->
    <div class="grid h-full grid-rows-[1fr_auto] md:grid-cols-[1fr_auto] md:grid-rows-1">
      <div class="min-h-0 min-w-0">
        <vflow
          #flow
          [nodes]="nodes()"
          [edges]="edges()"
          (initialized)="flow.fitView({ maxZoom: 1 })"
          (deleteRequest)="onDeleteRequest($event)">
          <docs-node *vNode="let ctx" [ctx]="ctx" />
          <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
        </vflow>
      </div>

      <pre
        class="border-vui-border bg-vui-surface text-vui-foreground m-0 overflow-auto border-t p-3.5 font-mono text-xs/5 md:w-76 md:border-t-0 md:border-l"
        tabindex="0"
        aria-label="Current shortcut configuration"
        data-testid="shortcuts-config"
        >{{ printed() }}</pre>
    </div>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
  providers: [
    provideVflow(
      withAccessibility({ flowLabel: 'Configured graph' }),
      // The form changes the keys at runtime, so the factory hands the flow the signal of the demo.
      withShortcuts(() => inject(ShortcutsConfigurationDemoComponent).shortcuts),
    ),
  ],
})
export class ShortcutsConfigurationDemoComponent {
  protected readonly select = signal('Enter,Space');
  protected readonly remove = signal('Delete,Backspace');
  protected readonly zoom = signal(true);
  protected readonly requests = signal(0);

  readonly shortcuts = computed<KeyboardShortcuts>(() => ({
    commands: {
      select: keys(this.select()),
      delete: keys(this.remove()),
      // Re-supplying the defaults is what turns the commands back on: an entry is replaced, never extended.
      ...(this.zoom() ? ZOOM_DEFAULTS : { zoomIn: [], zoomOut: [], fitView: [] }),
    },
  }));

  /** The object above as it would be written in code, which is what a reader copies. */
  protected readonly printed = computed(() => {
    const entries = Object.entries(this.shortcuts().commands ?? {}).map(
      ([name, bindings]) => `    ${name}: [${(bindings ?? []).map((key) => `'${key}'`).join(', ')}],`,
    );

    return ['{', '  commands: {', ...entries, '  },', '}'].join('\n');
  });

  protected readonly nodes = signal(
    createNodes([
      { id: 'draft', point: { x: 0, y: 0 }, data: { text: 'Draft' }, ariaLabel: 'Draft' },
      { id: 'review', point: { x: 140, y: 0 }, data: { text: 'Review' }, ariaLabel: 'Review' },
      { id: 'done', point: { x: 280, y: 0 }, data: { text: 'Done' }, ariaLabel: 'Done' },
    ]),
  );

  protected readonly edges = signal(
    createEdges([
      { id: 'to-review', source: 'draft', target: 'review', ariaLabel: 'To review' },
      { id: 'to-done', source: 'review', target: 'done', ariaLabel: 'To done' },
    ]),
  );

  protected chosen(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  protected onDeleteRequest(request: DeleteRequest): void {
    this.requests.update((count) => count + 1);

    const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }
}

/** A select holds its keys as one comma-separated value; the empty value binds nothing. */
function keys(value: string): string[] {
  return value ? value.split(',') : [];
}
