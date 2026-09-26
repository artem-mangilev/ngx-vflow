import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowUi } from '@vflow/ui';
import { AriaLabelConfig, DeleteRequest, Vflow, createEdges, createNodes, removeEdges, removeNodes } from 'ngx-vflow';

const SPANISH: Partial<AriaLabelConfig> = {
  flowLabel: 'Grafo de aprobación',
  nodeRole: 'nodo',
  groupRole: 'grupo',
  edgeRole: 'conexión',
  parentDescription: (parent) => `Padre: ${parent}.`,
  selected: 'Seleccionado.',
  selectionUnavailable: 'Selección no disponible.',
  movementUnavailable: 'Movimiento no disponible.',
  nodeInstructions: ({ select, move, delete: remove }, { selectable, movable }) =>
    [
      selectable && select ? `Pulse ${select} para seleccionar.` : '',
      movable && move ? `Use ${move} para moverlo mientras está seleccionado.` : '',
      remove ? `Pulse ${remove} para eliminar.` : '',
    ]
      .filter(Boolean)
      .join(' '),
  edgeInstructions: ({ select, delete: remove }, { selectable }) =>
    [selectable && select ? `Pulse ${select} para seleccionar.` : '', remove ? `Pulse ${remove} para eliminar.` : '']
      .filter(Boolean)
      .join(' '),
  selectionAnnouncement: ({ label, selected, count }) =>
    `${label} ${selected ? 'seleccionado' : 'deseleccionado'}. ${count} seleccionados en total.`,
  selectionClearedAnnouncement: 'Selección borrada.',
  movedAnnouncement: ({ count, direction, x, y }) => {
    const where = { left: 'a la izquierda', right: 'a la derecha', up: 'hacia arriba', down: 'hacia abajo' }[direction];
    return `${count === 1 ? 'Nodo movido' : `${count} nodos movidos`} ${where}. Posición: ${Math.round(x)}, ${Math.round(y)}.`;
  },
  zoomAnnouncement: (zoom) => `Zoom ${Math.round(zoom * 100)}%.`,
};

/**
 * One graph operated from the keyboard, with what a screen reader receives mirrored as text: the name and
 * description of the focused entity, and the last message of the live region.
 */
@Component({
  imports: [DocsPresentations, Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    vflow {
      height: 320px;
    }
    .editor {
      width: 220px;
    }
    .editor input {
      flex: 1;
      min-width: 0;
      font: inherit;
      padding: 4px 8px;
      border: 1px solid var(--vui-border);
      border-radius: 6px;
      background: var(--vui-surface);
      color: inherit;
    }
    .mirror {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 14px;
      margin: 0;
      padding: 14px;
      border-top: 1px solid var(--vui-border);
      font-size: 13px;
    }
    .mirror dt {
      color: var(--vui-muted);
    }
    .mirror dd {
      margin: 0;
    }
  `,
  template: `
    <section
      class="demo"
      data-testid="accessibility-demo"
      aria-label="Accessibility example"
      (focusin)="mirrorFocus($event)">
      <div class="controls">
        <p class="grow">
          Press Tab to enter the graph, Enter to select, the arrow keys to move a selected node and Delete to remove the
          focused node or edge. The Editor node keeps its own input and button.
        </p>
        <button vflowButton type="button" (click)="spanish.set(!spanish())">Switch graph language</button>
      </div>
      <vflow
        view="auto"
        [nodes]="nodes()"
        [edges]="edges()"
        [ariaLabelConfig]="labels()"
        (deleteRequest)="onDeleteRequest($event)">
        <ng-template let-ctx node>
          @if (ctx.node.id === 'editor') {
            <article vflowNode selectable class="editor" [vflowSelected]="ctx.selected() || ctx.preselected()">
              <header vflowNodeHeader><span vflowTitle>Editor</span></header>
              <div vflowField>
                <span vflowPort handleType="target" position="left"></span>
                <input vflowNoDrag aria-label="Node title" placeholder="Node title" />
              </div>
              <footer vflowNodeFooter>
                <button vflowButton vflowNoDrag type="button" (click)="removeEditor()">Remove editor</button>
              </footer>
            </article>
          } @else {
            <docs-node [ctx]="ctx" />
          }
        </ng-template>
        <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
      </vflow>
      <dl class="mirror" aria-hidden="true">
        <dt>Screen reader hears</dt>
        <dd data-testid="focused">{{ focused() || 'nothing focused' }}</dd>
        <dt>Last announcement</dt>
        <dd data-testid="announced">{{ announced() || 'none yet' }}</dd>
      </dl>
    </section>
  `,
})
export class AccessibilityDemoComponent {
  protected spanish = signal(false);
  protected focused = signal('');
  protected announced = signal('');
  protected labels = computed<Partial<AriaLabelConfig>>(() =>
    this.spanish() ? SPANISH : { flowLabel: 'Approval graph' },
  );
  protected nodes = signal(
    createNodes([
      { id: 'draft', parentId: 'stage', point: { x: 30, y: 40 }, data: { text: 'Draft' }, ariaLabel: 'Draft' },
      {
        id: 'stage',
        point: { x: 20, y: 20 },
        width: 240,
        height: 150,
        data: { type: 'group' },
        ariaLabel: 'Stage',
        selectable: false,
        draggable: false,
      },
      { id: 'editor', point: { x: 330, y: 40 }, ariaLabel: 'Editor' },
      { id: 'later', point: { x: 1000, y: 80 }, data: { text: 'Later' }, ariaLabel: 'Later' },
    ]),
  );
  protected edges = signal(
    createEdges([
      { id: 'next', source: 'draft', target: 'later', ariaLabel: 'Next step' },
      { id: 'edit', source: 'draft', target: 'editor', ariaLabel: 'Edit route', ariaDescription: 'Opens the editor.' },
    ]),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const region = host.querySelector('[aria-live]');
      if (!region) return;
      const observer = new MutationObserver(() => {
        const text = region.textContent?.trim();
        if (text) this.announced.set(text);
      });
      observer.observe(region, { childList: true, characterData: true, subtree: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected onDeleteRequest({ nodeIds, edgeIds }: DeleteRequest) {
    const result = removeNodes(nodeIds, { nodes: this.nodes(), edges: removeEdges(edgeIds, this.edges()) });
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }

  protected removeEditor() {
    this.onDeleteRequest({ nodeIds: ['editor'], edgeIds: [] });
  }

  protected mirrorFocus(event: FocusEvent) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const name = target.getAttribute('aria-label') ?? target.textContent?.trim() ?? '';
    const role =
      target.getAttribute('aria-roledescription') ?? target.getAttribute('role') ?? target.tagName.toLowerCase();
    const description = (target.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .map((id) => target.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
    this.focused.set([`${name}, ${role}.`, description].filter(Boolean).join(' '));
  }
}
