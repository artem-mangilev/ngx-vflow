import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DemoIconComponent, DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  DeleteRequest,
  Edge,
  NodeWithDefaults,
  StaticNode,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';
import { ScrollRows } from './scroll-rows';

interface Field {
  id: string;
  name: string;
  type: string;
  key: string;
}
interface EntityData {
  kind: 'entity';
  title: string;
  category: string;
  fields: Field[];
}
/** A titled frame around one diagram; the canvas holds two unrelated ones. */
interface FrameData {
  kind: 'frame';
  title: string;
}

const TYPES = ['uuid', 'text', 'decimal', 'timestamp'];

/**
 * Free ports show on interaction, connected ones always: an idle port without an edge is invisible, though still a
 * target, until its table is hovered, focused or selected. The table host is an element of core, so its state is read
 * from the port itself. Proxy ports, on the header and the footer, share one point per border: connected ones are
 * visually merged.
 */
const QUIET_PORT = `transition-[border-color,background-color,box-shadow,opacity]!
  [&[data-v-handle-state=idle]:not([data-vui-connected=true]):not([data-v-node]:hover_*,[data-v-node]:focus-within_*,[data-v-selected]_*,[data-v-preselected]_*)]:opacity-0
  forced-colors:opacity-100! [:is(header,footer)>&]:data-[vui-connected=true]:opacity-60`;

@Component({
  selector: 'app-ui-entities-demo',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <docs-demo framed role="region" aria-label="Entity relationships and field mapping demo">
      <!-- Tall enough for the two frames to fit at nearly their real size. -->
      <div class="h-175">
        <vflow
          [nodes]="nodes"
          [edges]="edges()"
          [background]="background"
          [connection]="connection"
          [parentsBelowEdges]="true"
          (connect)="connect($event)"
          (deleteRequest)="remove($event)"
          (initialized)="flow().fitView({ maxZoom: 1 })">
          <ng-template let-ctx vNode>
            @if (ctx.data().kind === 'frame') {
              <div
                vuiGroup
                [attr.data-frame]="ctx.node.id"
                [style.width.px]="ctx.width()"
                [style.height.px]="ctx.height()">
                <header vuiGroupHeader>
                  <span vuiTitle>{{ ctx.data().title }}</span>
                </header>
              </div>
            } @else {
              @let view = scroll.visibility(ctx.node.id);
              <article vuiNode class="w-[250px] text-[14px]" [attr.data-entity]="ctx.node.id">
                <header vuiNodeHeader>
                  <span vuiTitle>{{ ctx.data().title }}</span>
                  <span vuiMeta>{{ ctx.data().category }}</span>
                  <!-- Rows scrolled out above hand their endpoints to proxies with the same IDs on the header. -->
                  @for (field of scroll.hidden(ctx.data().fields, view.above); track field.id) {
                    <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                  }
                </header>
                <ng-template #ports let-field>
                  <span
                    vuiPort
                    handleType="target"
                    position="left"
                    [class]="quietPort"
                    [handleId]="'in:' + field.id"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/in:' + field.id)"></span>
                  <span
                    vuiPort
                    handleType="source"
                    position="right"
                    [class]="quietPort"
                    [handleId]="'out:' + field.id"
                    [vuiPortConnected]="connected().has(ctx.node.id + '/out:' + field.id)"></span>
                </ng-template>
                <ng-template #rows>
                  @for (row of scroll.rows(ctx.node.id, ctx.data().fields); track row.key) {
                    <div vuiRow class="group" [attr.data-field]="row.field.id">
                      <!-- Keys are structure, not state: the accent belongs to selection. -->
                      <span class="min-w-5.5 text-xs font-semibold text-vui-muted">{{ row.field.key }}</span>
                      <span vuiTitle>{{ row.field.name }}</span>
                      <span vuiMeta>{{ row.field.type }}</span>
                      <!-- Row actions appear on the row a pointer or the focus is on, and on every row of a selected
                           table (touch). -->
                      <button
                        docsButton="plain"
                        small
                        icon
                        class="opacity-0 transition-opacity! group-focus-within:opacity-100 group-hover:opacity-100 [&:is([data-v-selected]_*)]:opacity-100"
                        vNoDrag
                        type="button"
                        [attr.aria-label]="'Delete ' + ctx.data().title + '.' + row.field.name"
                        (click)="deleteField(ctx.node.id, row.field.id)">
                        <app-demo-icon name="close" />
                      </button>
                      @if (row.handles) {
                        <ng-container *ngTemplateOutlet="ports; context: { $implicit: row.field }" />
                      }
                    </div>
                  }
                </ng-template>
                @if (ctx.data().fields.length > maxRows) {
                  <!-- Seven rows, then the table scrolls; the wheel scrolls its rows instead of zooming the graph. -->
                  <div
                    class="max-h-[calc(7*33px-1px)] overflow-y-auto overscroll-contain"
                    vNoWheel
                    [attr.data-rows]="ctx.node.id"
                    (scroll)="scroll.onScroll(ctx.node.id, $event)">
                    <ng-container *ngTemplateOutlet="rows" />
                  </div>
                } @else {
                  <div><ng-container *ngTemplateOutlet="rows" /></div>
                }
                @if (view.below.length) {
                  <!-- Rows cut by the scroll box fade into the border below; a mask on the box would also cut the
                       ports. -->
                  <footer
                    vuiNodeFooter
                    class="relative min-h-5 py-1 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-6 before:bg-linear-to-b before:from-transparent before:to-vui-surface before:content-['']">
                    <span vuiMeta>{{ view.below.length }} more below</span>
                    @for (field of scroll.hidden(ctx.data().fields, view.below); track field.id) {
                      <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                    }
                  </footer>
                }
                @if (draft()?.entity === ctx.node.id) {
                  <!-- Enter adds the field, Escape drops the draft; core leaves keys typed in inputs alone.
                     Editing a draft is not selecting the table: the row and the button opt out of click selection. -->
                  <div vuiRow vNoSelect data-draft>
                    <input
                      docsInput
                      class="min-w-0 flex-1"
                      vNoDrag
                      placeholder="field_name"
                      [attr.aria-label]="'Name of the new field of ' + ctx.data().title"
                      [attr.aria-invalid]="draftError()"
                      [value]="draft()!.name"
                      (input)="editDraft({ name: $any($event.target).value })"
                      (keydown.enter)="commitDraft()"
                      (keydown.escape)="cancelDraft()" />
                    <select
                      docsSelect
                      vNoDrag
                      [attr.aria-label]="'Type of the new field of ' + ctx.data().title"
                      (change)="editDraft({ type: $any($event.target).value })"
                      (keydown.enter)="commitDraft()"
                      (keydown.escape)="cancelDraft()">
                      @for (type of types; track type) {
                        <option [value]="type" [selected]="type === draft()!.type">{{ type }}</option>
                      }
                    </select>
                  </div>
                } @else {
                  <!-- A quiet last row of every table; it turns into the draft of a new field. -->
                  <button
                    class="box-border flex w-full cursor-pointer items-center gap-1.5 rounded-b-vui-surface border-0 border-t border-solid border-vui-separator bg-transparent px-3 py-1.5 font-[inherit] text-[12px] leading-[inherit] text-vui-muted hover:bg-vui-surface-muted hover:text-vui-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-vui-accent"
                    vNoDrag
                    vNoSelect
                    type="button"
                    [attr.aria-label]="'Add a field to ' + ctx.data().title"
                    (click)="startDraft(ctx.node.id)">
                    <app-demo-icon name="plus" /> Add field
                  </button>
                }
              </article>
            }
          </ng-template>
          <ng-template let-ctx vEdge>
            <svg:g>
              <svg:path vuiEdge [attr.d]="ctx.path()" />
            </svg:g>
            @if (ctx.data()?.label; as label) {
              <span *vEdgeLabel vuiEdgeLabel class="group" [attr.data-selected]="ctx.selected()">
                {{ label }}
                <!-- The remove button shows on hover and while the edge is selected; Delete removes it as well. -->
                <span class="hidden group-hover:inline-flex group-data-[selected=true]:inline-flex">
                  <button
                    docsButton="plain"
                    small
                    icon
                    vNoDrag
                    type="button"
                    [attr.aria-label]="'Remove ' + label + ' connection'"
                    (click)="removeEdge(ctx.edge.id)">
                    <app-demo-icon name="close" />
                  </button>
                </span>
              </span>
            }
          </ng-template>
          <ng-template let-ctx vConnection>
            @if (ctx.path(); as path) {
              <svg:path vuiEdge stroke-dasharray="4 4" [attr.d]="path" />
            }
          </ng-template>
          <vui-controls vPanel="bottom-left" />
        </vflow>
      </div>
    </docs-demo>
  `,
})
export class EntitiesDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  protected readonly background = SCENE_BACKGROUND;
  protected readonly types = TYPES;
  protected readonly quietPort = QUIET_PORT;
  /** Rows a table shows before it scrolls. */
  protected readonly maxRows = 7;
  protected readonly scroll = new ScrollRows<Field>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** The field being added: one table at a time. */
  protected readonly draft = signal<{ entity: string; name: string; type: string } | null>(null);
  /** The draft name is empty or taken. */
  protected readonly draftError = signal(false);
  /** The height a frame was created with: its minimum. */
  private readonly frameHeight: Record<string, number> = { relationships: 266, mapping: 234 };
  /** The first measured height of every table, which its frame's growth is counted from. */
  private readonly tableHeight: Record<string, number> = {};
  protected readonly nodes = createNodes([
    frame('relationships', { x: 0, y: 0 }, 'Relationships', this.frameHeight['relationships']),
    frame('mapping', { x: 0, y: 446 }, 'Field mapping', this.frameHeight['mapping']),
    entity('customer', 'relationships', { x: 24, y: 56 }, 'Customer', 'table', [
      ['id', 'id', 'uuid', 'PK'],
      ['email', 'email', 'text'],
      ['name', 'name', 'text'],
    ]),
    entity('order', 'relationships', { x: 454, y: 56 }, 'Order', 'table', [
      ['id', 'id', 'uuid', 'PK'],
      ['customer-id', 'customer_id', 'uuid', 'FK'],
      ['total', 'total', 'decimal'],
    ]),
    entity('crm', 'mapping', { x: 24, y: 56 }, 'CRM contact', 'Source', [
      ['email', 'email', 'text'],
      ['name', 'full_name', 'text'],
    ]),
    entity('erp', 'mapping', { x: 454, y: 56 }, 'ERP contact', 'Target', [
      ['email', 'contact_email', 'text'],
      ['name', 'display_name', 'text'],
    ]),
  ]);
  protected readonly edges = signal<Edge[]>(
    createEdges([
      {
        id: 'foreign-key',
        source: 'customer',
        sourceHandle: 'out:id',
        target: 'order',
        targetHandle: 'in:customer-id',
        data: { label: '1 → N' },
      },
      {
        id: 'email-mapping',
        source: 'crm',
        sourceHandle: 'out:email',
        target: 'erp',
        targetHandle: 'in:email',
        data: { label: 'Copy email' },
      },
    ]),
  );
  /** `${nodeId}/${handleId}` for every endpoint of an existing edge. */
  protected readonly connected = computed(
    () =>
      new Set(
        this.edges().flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
      ),
  );
  protected readonly connection: ConnectionSettings<NodeWithDefaults<EntityData | FrameData>> = {
    validator: ({ source, target }) => {
      const from = this.field(source.node.data(), 'out:', source.handle.id);
      const to = this.field(target.node.data(), 'in:', target.handle.id);
      return !!from && !!to && from.type === to.type;
    },
  };

  /** The label says what the connection does: a mapping copies its source field, a relation is one to many. */
  protected connect(connection: Connection) {
    const node = this.nodes.find((node) => node.id === connection.source);
    const mapping = node?.parentId() === 'mapping';
    const source = this.field(node?.data(), 'out:', connection.sourceHandle)!;
    const edge = createEdge({
      ...connection,
      id: crypto.randomUUID(),
      data: { label: mapping ? `Copy ${source.name}` : '1 → N' },
    });
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  protected startDraft(entity: string) {
    this.draft.set({ entity, name: '', type: 'text' });
    this.draftError.set(false);
    afterNextRender(() => this.host.querySelector<HTMLInputElement>('[data-draft] input')?.focus(), {
      injector: this.injector,
    });
  }

  protected editDraft(change: { name?: string; type?: string }) {
    this.draft.update((draft) => draft && { ...draft, ...change });
    this.draftError.set(false);
  }

  /** Adds the field with an ID made from its name; the new row gets its own ports, ready to connect. */
  protected commitDraft() {
    const draft = this.draft();
    if (!draft) return;
    const name = draft.name.trim().replace(/\s+/g, '_');
    const node = this.nodes.find((entity) => entity.id === draft.entity)!;
    const data = node.data();
    if (data.kind !== 'entity' || !name || data.fields.some((field) => field.name === name)) {
      this.draftError.set(true);
      return;
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    node.data.set({ ...data, fields: [...data.fields, { id, name, type: draft.type, key: '' }] });
    this.draft.set(null);
    this.scroll.reset(draft.entity);
    // A long table scrolls to its new last row.
    afterNextRender(
      () => {
        const box = this.host.querySelector<HTMLElement>(`[data-rows="${draft.entity}"]`);
        if (box) box.scrollTop = box.scrollHeight;
      },
      { injector: this.injector },
    );
  }

  protected cancelDraft() {
    this.draft.set(null);
    this.draftError.set(false);
  }

  /** Delete removes the selected connections; tables and frames stay. */
  protected remove({ edgeIds }: DeleteRequest) {
    this.edges.update((edges) => edges.filter((edge) => !edgeIds.includes(edge.id)));
  }

  /** Deleting a field is an application decision: its edges go with it, nothing is left detached. */
  protected deleteField(nodeId: string, fieldId: string) {
    const node = this.nodes.find((entity) => entity.id === nodeId)!;
    node.data.update((data) =>
      data.kind === 'entity' ? { ...data, fields: data.fields.filter((field) => field.id !== fieldId) } : data,
    );
    this.scroll.reset(nodeId);
    this.edges.update((edges) =>
      edges.filter(
        (edge) =>
          !(edge.source === nodeId && edge.sourceHandle === 'out:' + fieldId) &&
          !(edge.target === nodeId && edge.targetHandle === 'in:' + fieldId),
      ),
    );
  }

  constructor() {
    // A frame grows with the fields of its tables, by as much as its tallest table grew since the first render, and
    // never shrinks below its own height. Where a table is dragged does not matter: tables and frames move freely.
    // Measured sizes arrive after render, so this follows them instead of running once after a change.
    effect(() => {
      const flow = this.flow();
      for (const frame of this.nodes.filter((node) => node.data().kind === 'frame')) {
        const growth = this.nodes
          .filter((node) => node.parentId?.() === frame.id)
          .map((node) => {
            const rect = flow.getNodeRect(node.id);
            if (!rect) return 0;
            this.tableHeight[node.id] ??= rect.height;
            return rect.height - this.tableHeight[node.id];
          });
        const height = this.frameHeight[frame.id] + Math.max(0, ...growth);
        untracked(() => {
          if (frame.height!() !== height) frame.height!.set(height);
        });
      }
    });
  }

  protected removeEdge(id: string) {
    this.edges.update((edges) => edges.filter((edge) => edge.id !== id));
  }

  private field(data: EntityData | FrameData | undefined, prefix: 'in:' | 'out:', handle?: string) {
    return data?.kind === 'entity' ? data.fields.find((field) => prefix + field.id === handle) : undefined;
  }
}

function frame(id: string, point: { x: number; y: number }, title: string, height: number): StaticNode<FrameData> {
  return { id, point, width: 728, height, ariaLabel: title, data: { kind: 'frame', title } };
}

function entity(
  id: string,
  parentId: string,
  point: { x: number; y: number },
  title: string,
  category: string,
  fields: [string, string, string, string?][],
): StaticNode<EntityData> {
  return {
    id,
    parentId,
    point,
    ariaLabel: `${title} ${category === 'table' ? 'entity' : category.toLowerCase() + ' schema'}`,
    data: {
      kind: 'entity',
      title,
      category,
      fields: fields.map(([fieldId, name, type, key = '']) => ({ id: fieldId, name, type, key })),
    },
  };
}
