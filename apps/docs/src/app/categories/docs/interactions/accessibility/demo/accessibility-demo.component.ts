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
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  AriaLabelConfig,
  DeleteRequest,
  Vflow,
  createEdges,
  createNodes,
  provideVflow,
  removeElements,
  withAccessibility,
} from 'ngx-vflow';

const SPANISH: Partial<AriaLabelConfig> = {
  flowLabel: 'Grafo de aprobación',
  nodeRole: 'nodo',
  parentRole: 'grupo',
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
  template: `<docs-demo
    data-testid="accessibility-demo"
    role="region"
    aria-label="Accessibility example"
    (focusin)="mirrorFocus($event)">
    <div docsDemoBar>
      <p class="min-w-0 flex-1">
        Tab into the graph: Enter selects, the arrow keys move a selected node, Delete removes the focused node or edge.
      </p>
      <span docsBadge>{{ spanish() ? 'Spanish' : 'English' }}</span>
      <button docsButton type="button" (click)="spanish.set(!spanish())">Switch graph language</button>
    </div>

    <div class="flex h-full flex-col">
      <div class="min-h-0 flex-1">
        <!--
          The Later node waits offscreen on purpose: the view pans to it when focus reaches it. So the first view
          fits the rest of the graph, not all of it.
        -->
        <vflow
          #flow
          [nodes]="nodes()"
          [edges]="edges()"
          (initialized)="flow.fitView({ nodes: ['stage', 'editor'], maxZoom: 1 })"
          (deleteRequest)="onDeleteRequest($event)">
          <ng-template let-ctx vNode>
            @if (ctx.node.id === 'editor') {
              <article vuiNode class="w-55 text-[13px]">
                <header vuiNodeHeader><span vuiTitle>Editor</span></header>
                <div vuiRow>
                  <span vuiPort handleType="target" position="left"></span>
                  <!-- Controls inside a node keep their own keys and Tab stops. -->
                  <input docsInput class="min-w-0 flex-1" vNoDrag aria-label="Node title" placeholder="Node title" />
                  <span vuiPort handleType="source" position="right"></span>
                </div>
                <footer vuiNodeFooter>
                  <button docsButton small type="button" vNoDrag (click)="removeEditor()">Remove editor</button>
                </footer>
              </article>
            } @else {
              <docs-node [ctx]="ctx" />
            }
          </ng-template>
          <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
        </vflow>
      </div>

      <!-- A sighted copy of what assistive technology already receives, so it is hidden from it. -->
      <dl
        class="border-vui-border m-0 grid grid-cols-[max-content_1fr] items-baseline gap-x-3.5 gap-y-1.5 border-t p-3.5 text-[13px] leading-5"
        aria-hidden="true">
        <dt class="text-vui-muted">Screen reader hears</dt>
        <dd class="m-0 min-h-[2lh]" data-testid="focused">{{ focused() || 'nothing focused' }}</dd>
        <dt class="text-vui-muted">Last announcement</dt>
        <dd class="m-0" data-testid="announced">{{ announced() || 'none yet' }}</dd>
      </dl>
    </div>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
  // The labels follow the language at runtime, so the factory hands the flow the signal of the demo.
  providers: [provideVflow(withAccessibility(() => inject(AccessibilityDemoComponent).labels))],
})
export class AccessibilityDemoComponent {
  protected readonly spanish = signal(false);
  protected readonly focused = signal('');
  protected readonly announced = signal('');

  readonly labels = computed<Partial<AriaLabelConfig>>(() =>
    this.spanish() ? SPANISH : { flowLabel: 'Approval graph' },
  );

  protected readonly nodes = signal(
    createNodes([
      { id: 'draft', parentId: 'stage', point: { x: 70, y: 60 }, data: { text: 'Draft' }, ariaLabel: 'Draft' },
      {
        id: 'stage',
        point: { x: 0, y: 0 },
        width: 240,
        height: 150,
        data: { type: 'group', text: 'Stage' },
        ariaLabel: 'Stage',
        selectable: false,
        draggable: false,
      },
      { id: 'editor', point: { x: 300, y: 17 }, ariaLabel: 'Editor' },
      { id: 'later', point: { x: 1000, y: 60 }, data: { text: 'Later' }, ariaLabel: 'Later' },
    ]),
  );

  protected readonly edges = signal(
    createEdges([
      { id: 'next', source: 'editor', target: 'later', ariaLabel: 'Next step' },
      { id: 'edit', source: 'draft', target: 'editor', ariaLabel: 'Edit route', ariaDescription: 'Opens the editor.' },
    ]),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    // The flow announces through its live region; the demo copies each message into the mirror.
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

  // Delete and Backspace only ask: the application removes the entities from its own collections.
  protected onDeleteRequest(request: DeleteRequest): void {
    const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
  }

  protected removeEditor(): void {
    this.onDeleteRequest({ nodeIds: ['editor'], edgeIds: [] });
  }

  /** The accessible name, role and description of the element that took focus, read from its ARIA attributes. */
  protected mirrorFocus(event: FocusEvent): void {
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
