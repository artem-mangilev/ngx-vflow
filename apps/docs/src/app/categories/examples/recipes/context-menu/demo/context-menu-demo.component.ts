import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Point, Vflow, VflowComponent, addNodes, createEdges, createNodes, removeElements } from 'ngx-vflow';

/** What the menu was opened on, and where in the stage it shows. */
type MenuTarget = { kind: 'node' | 'edge'; id: string } | { kind: 'pane'; point: Point };

@Component({
  template: `<docs-demo>
    <vflow
      #flow
      [nodes]="nodes()"
      [edges]="edges()"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (contextmenu)="open($event)">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>

    @if (menu(); as menu) {
      <div
        #menuElement
        vuiToolbar
        role="menu"
        class="absolute z-10 flex-col items-stretch"
        [style.left.px]="menu.at.x"
        [style.top.px]="menu.at.y"
        (keydown.escape)="close()"
        (focusout)="closeOnLeave($event)">
        @switch (menu.target.kind) {
          @case ('node') {
            <button
              docsButton="plain"
              role="menuitem"
              type="button"
              class="justify-start!"
              (click)="duplicate(menu.target)">
              Duplicate
            </button>
            <button
              docsButton="plain"
              role="menuitem"
              type="button"
              class="justify-start!"
              (click)="remove(menu.target)">
              Delete node
            </button>
          }
          @case ('edge') {
            <button
              docsButton="plain"
              role="menuitem"
              type="button"
              class="justify-start!"
              (click)="remove(menu.target)">
              Delete edge
            </button>
          }
          @case ('pane') {
            <button docsButton="plain" role="menuitem" type="button" class="justify-start!" (click)="add(menu.target)">
              Add node here
            </button>
            <button docsButton="plain" role="menuitem" type="button" class="justify-start!" (click)="fit()">
              Fit view
            </button>
          }
        }
      </div>
    }
  </docs-demo>`,
  host: { class: 'block size-full', '(document:pointerdown)': 'closeOnOutside($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui],
})
export class ContextMenuDemoComponent {
  private readonly flow = viewChild.required(VflowComponent);
  private readonly menuElement = viewChild<ElementRef<HTMLElement>>('menuElement');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly nodes = signal(
    createNodes([
      { id: 'lead', point: { x: 0, y: 40 }, data: { text: 'Lead' } },
      { id: 'call', point: { x: 180, y: 0 }, data: { text: 'Call' } },
      { id: 'deal', point: { x: 360, y: 40 }, data: { text: 'Deal' } },
    ]),
  );
  protected readonly edges = signal(
    createEdges([
      { id: 'lead-call', source: 'lead', target: 'call' },
      { id: 'call-deal', source: 'call', target: 'deal' },
    ]),
  );

  protected readonly menu = signal<{ target: MenuTarget; at: Point } | null>(null);

  /**
   * One listener for the whole flow: the host of a node or an edge carries its id in `data-v-node` or `data-v-edge`,
   * and anything else is the pane. The context-menu key and Shift+F10 open it on the focused node or edge.
   */
  protected open(event: MouseEvent): void {
    const element = event.target as Element;
    const entity = element.closest('[data-v-node], [data-v-edge]');
    const stage = this.host.nativeElement.querySelector('vflow')!.getBoundingClientRect();

    // A menu opened from the keyboard has no pointer position: show it at the focused element.
    const fromKeyboard = event.button !== 2 && event.clientX === 0 && event.clientY === 0;
    const anchor = fromKeyboard ? element.getBoundingClientRect() : null;
    const client = anchor ? { x: anchor.left, y: anchor.bottom } : { x: event.clientX, y: event.clientY };

    let target: MenuTarget;
    if (entity?.hasAttribute('data-v-node')) target = { kind: 'node', id: entity.getAttribute('data-v-node')! };
    else if (entity) target = { kind: 'edge', id: entity.getAttribute('data-v-edge')! };
    else target = { kind: 'pane', point: this.flow().clientToFlowPosition(client) };

    event.preventDefault();
    this.menu.set({ target, at: { x: client.x - stage.left, y: client.y - stage.top } });
    afterNextRender(() => this.menuElement()?.nativeElement.querySelector('button')?.focus(), {
      injector: this.injector,
    });
  }

  protected close(): void {
    this.menu.set(null);
  }

  protected closeOnOutside(event: PointerEvent): void {
    if (!this.menuElement()?.nativeElement.contains(event.target as Node)) this.close();
  }

  protected closeOnLeave(event: FocusEvent): void {
    if (!this.menuElement()?.nativeElement.contains(event.relatedTarget as Node)) this.close();
  }

  protected duplicate(target: { id: string }): void {
    const node = this.nodes().find((node) => node.id === target.id);
    if (node) {
      const { x, y } = node.point();
      const [copy] = createNodes([{ id: crypto.randomUUID(), point: { x: x + 30, y: y + 70 }, data: node.data() }]);
      this.nodes.update((nodes) => addNodes([copy], nodes));
    }
    this.close();
  }

  protected remove(target: { kind: 'node' | 'edge'; id: string }): void {
    const request = target.kind === 'node' ? { nodeIds: [target.id] } : { edgeIds: [target.id] };
    const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });
    this.nodes.set(result.nodes);
    this.edges.set(result.edges);
    this.close();
  }

  protected add(target: { point: Point }): void {
    const [node] = createNodes([{ id: crypto.randomUUID(), point: target.point, data: { text: 'New step' } }]);
    this.nodes.update((nodes) => addNodes([node], nodes));
    this.close();
  }

  protected fit(): void {
    this.flow().fitView({ maxZoom: 1, duration: 200 });
    this.close();
  }
}
