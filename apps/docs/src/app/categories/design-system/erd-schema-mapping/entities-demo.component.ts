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
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Vui } from '@vflow/ui';
import { DemoIconComponent } from '../../../shared/demo-icon.component';
import { injectDocsTheme } from '../../../shared/docs-theme';
import { ScrollRows } from './scroll-rows';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  DeleteRequest,
  Edge,
  Node,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';

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
type SchemaData = EntityData | FrameData;

const TYPES = ['uuid', 'text', 'decimal', 'timestamp'];

@Component({
  selector: 'app-ui-entities-demo',
  imports: [Vflow, Vui, DemoIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    article {
      width: 250px;
      font-size: 14px;
    }
    vflow {
      height: 560px;
    }
    /* Keys are structure, not state: the accent belongs to selection. */
    .key {
      min-width: 22px;
      color: var(--vui-muted);
      font-weight: 600;
    }
    /* Row actions appear on the row a pointer or the focus is on, and on every row of a selected table (touch). */
    .row-action {
      opacity: 0;
      transition: opacity 120ms;
    }
    .vui-row:hover .row-action,
    .vui-row:focus-within .row-action,
    article[data-vui-selected='true'] .row-action {
      opacity: 1;
    }
    /* The remove button of a label shows on hover and while its edge is selected; Delete removes it as well. */
    .vui-edge-label .row-action {
      display: none;
      opacity: 1;
    }
    .vui-edge-label:hover .row-action,
    .vui-edge-label[data-selected='true'] .row-action {
      display: inline-flex;
    }
    /* A quiet last row of every table; it turns into the draft of a new field. */
    .add-field {
      display: flex;
      box-sizing: border-box;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 6px 12px;
      border: 0;
      border-top: 1px solid color-mix(in oklab, var(--vui-border) 50%, transparent);
      /* The bottom corners of the card: its radius is the control radius plus one spacing unit. */
      border-radius: 0 0 calc(var(--vui-radius) + var(--vui-space)) calc(var(--vui-radius) + var(--vui-space));
      background: transparent;
      color: var(--vui-muted);
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .add-field:hover {
      background: var(--vui-surface-muted);
      color: var(--vui-foreground);
    }
    .add-field:focus-visible {
      outline: 2px solid var(--vui-accent);
      outline-offset: -2px;
    }
    /* Seven rows, then the table scrolls. */
    .rows.scrolling {
      max-height: calc(7 * 33px - 1px);
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    /* Rows cut by the scroll box fade into the border below; a mask on the box would also cut the ports. */
    .edge-note {
      position: relative;
      min-height: 20px;
      padding-block: 4px;
    }
    .edge-note::before {
      content: '';
      position: absolute;
      inset-inline: 0;
      bottom: 100%;
      height: 24px;
      background: linear-gradient(to bottom, transparent, var(--vui-surface));
      pointer-events: none;
    }
    /* Proxy handles share one point per border; their connected ports are visually merged. */
    .proxy .vui-port[data-vui-connected='true'] {
      opacity: 0.6;
    }
    .draft .input {
      flex: 1;
      min-width: 0;
    }
  `,
  template: `
    <section class="demo" aria-label="Entity relationships and field mapping demo" [attr.data-vui-theme]="theme()">
      <vflow
        view="auto"
        [nodes]="nodes"
        [edges]="edges()"
        [connection]="connection"
        [parentsBelowEdges]="true"
        (connect)="connect($event)"
        (deleteRequest)="remove($event)"
        (initialized)="flow()?.fitView()">
        <ng-template let-ctx vNode>
          @if (ctx.data().kind === 'frame') {
            <div
              vuiGroup
              [selected]="ctx.selected() || ctx.preselected()"
              [attr.data-frame]="ctx.node.id"
              [style.width.px]="ctx.width()"
              [style.height.px]="ctx.height()">
              <header vuiGroupHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
              </header>
            </div>
          } @else {
            @let view = scroll.visibility(ctx.node.id);
            <article vuiNode [selected]="ctx.selected() || ctx.preselected()" [attr.data-entity]="ctx.node.id">
              <header vuiNodeHeader [class.proxy]="view.above.length > 0">
                <span vuiTitle>{{ ctx.data().title }}</span>
                <span vuiMeta>{{ ctx.data().category }}</span>
                <!-- Rows scrolled out above hand their endpoints to proxies with the same IDs on the header. -->
                @for (field of scroll.hidden(ctx.data().fields, view.above); track field.id) {
                  <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                }
              </header>
              <ng-template #ports let-field>
                <!-- Free ports show on interaction; connected ones always do. -->
                <span
                  vuiPort
                  vuiPortReveal="interaction"
                  handleType="target"
                  position="left"
                  [handleId]="'in:' + field.id"
                  [vuiPortConnected]="connected().has(ctx.node.id + '/in:' + field.id)"></span>
                <span
                  vuiPort
                  vuiPortReveal="interaction"
                  handleType="source"
                  position="right"
                  [handleId]="'out:' + field.id"
                  [vuiPortConnected]="connected().has(ctx.node.id + '/out:' + field.id)"></span>
              </ng-template>
              <ng-template #rows>
                @for (row of scroll.rows(ctx.node.id, ctx.data().fields); track row.key) {
                  <div vuiRow [attr.data-field]="row.field.id">
                    <span vuiMeta class="key">{{ row.field.key }}</span>
                    <span vuiTitle>{{ row.field.name }}</span>
                    <span vuiMeta>{{ row.field.type }}</span>
                    <button
                      class="button plain small icon row-action"
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
                <!-- A long table scrolls; the wheel scrolls its rows instead of zooming the graph. -->
                <div
                  class="rows scrolling"
                  vNoWheel
                  [attr.data-rows]="ctx.node.id"
                  (scroll)="scroll.onScroll(ctx.node.id, $event)">
                  <ng-container *ngTemplateOutlet="rows" />
                </div>
              } @else {
                <div class="rows"><ng-container *ngTemplateOutlet="rows" /></div>
              }
              @if (view.below.length) {
                <footer vuiNodeFooter class="proxy edge-note">
                  <span vuiMeta>{{ view.below.length }} more below</span>
                  @for (field of scroll.hidden(ctx.data().fields, view.below); track field.id) {
                    <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                  }
                </footer>
              }
              @if (draft()?.entity === ctx.node.id) {
                <!-- Enter adds the field, Escape drops the draft; core leaves keys typed in inputs alone.
                     Editing a draft is not selecting the table: the row and the button opt out of click selection. -->
                <div vuiRow vNoSelect class="draft" data-draft>
                  <input
                    class="input"
                    vNoDrag
                    placeholder="field_name"
                    [attr.aria-label]="'Name of the new field of ' + ctx.data().title"
                    [attr.aria-invalid]="draftError()"
                    [value]="draft()!.name"
                    (input)="editDraft({ name: $any($event.target).value })"
                    (keydown.enter)="commitDraft()"
                    (keydown.escape)="cancelDraft()" />
                  <select
                    class="select"
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
                <button
                  class="add-field"
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
          <svg:g vEdgeInteraction>
            <svg:path vuiEdge [attr.d]="ctx.path()" [selected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
          @if (ctx.data()?.label; as label) {
            <span *vEdgeLabel vuiEdgeLabel [attr.data-selected]="ctx.selected()">
              {{ label }}
              <button
                class="button plain small icon row-action"
                vNoDrag
                type="button"
                [attr.aria-label]="'Remove ' + label + ' connection'"
                (click)="removeEdge(ctx.edge.id)">
                <app-demo-icon name="close" />
              </button>
            </span>
          }
        </ng-template>
        <ng-template let-ctx vConnection>
          @if (ctx.path(); as path) {
            <svg:path vuiEdge stroke-dasharray="5 4" [attr.d]="path" />
          }
        </ng-template>
      </vflow>
    </section>
  `,
})
export class EntitiesDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly theme = injectDocsTheme();
  readonly types = TYPES;
  /** Rows a table shows before it scrolls. */
  readonly maxRows = 7;
  readonly scroll = new ScrollRows<Field>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** The field being added: one table at a time. */
  readonly draft = signal<{ entity: string; name: string; type: string } | null>(null);
  /** The draft name is empty or taken. */
  readonly draftError = signal(false);
  /** The height a frame was created with: its minimum. */
  private readonly frameHeight: Record<string, number> = { relationships: 266, mapping: 234 };
  /** The first measured height of every table, which its frame's growth is counted from. */
  private readonly tableHeight: Record<string, number> = {};
  readonly nodes = createNodes<SchemaData>([
    frame('relationships', { x: 0, y: 0 }, 'Relationships', this.frameHeight['relationships']),
    frame('mapping', { x: 0, y: 480 }, 'Field mapping', this.frameHeight['mapping']),
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
  ]) as (Node<SchemaData> & { data: WritableSignal<SchemaData> })[];
  readonly edges = signal<Edge[]>(
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
  readonly connected = computed(
    () =>
      new Set(
        this.edges().flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
      ),
  );
  readonly connection: ConnectionSettings = {
    validator: (c) => {
      const source = this.field(c.source, 'out:', c.sourceHandle);
      const target = this.field(c.target, 'in:', c.targetHandle);
      return !!source && !!target && source.type === target.type;
    },
  };

  /** The label says what the connection does: a mapping copies its source field, a relation is one to many. */
  connect(connection: Connection) {
    const mapping = this.nodes.find((node) => node.id === connection.source)?.parentId?.() === 'mapping';
    const source = this.field(connection.source, 'out:', connection.sourceHandle)!;
    const edge = createEdge({
      ...connection,
      id: crypto.randomUUID(),
      data: { label: mapping ? `Copy ${source.name}` : '1 → N' },
    });
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  startDraft(entity: string) {
    this.draft.set({ entity, name: '', type: 'text' });
    this.draftError.set(false);
    afterNextRender(() => this.host.querySelector<HTMLInputElement>('[data-draft] input')?.focus(), {
      injector: this.injector,
    });
  }

  editDraft(change: { name?: string; type?: string }) {
    this.draft.update((draft) => draft && { ...draft, ...change });
    this.draftError.set(false);
  }

  /** Adds the field with an ID made from its name; the new row gets its own ports, ready to connect. */
  commitDraft() {
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

  cancelDraft() {
    this.draft.set(null);
    this.draftError.set(false);
  }

  /** Delete removes the selected connections; tables and frames stay. */
  remove({ edgeIds }: DeleteRequest) {
    this.edges.update((edges) => edges.filter((edge) => !edgeIds.includes(edge.id)));
  }

  /** Deleting a field is an application decision: its edges go with it, nothing is left detached. */
  deleteField(nodeId: string, fieldId: string) {
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
      if (!flow) return;
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

  removeEdge(id: string) {
    this.edges.update((edges) => edges.filter((edge) => edge.id !== id));
  }

  private field(nodeId: string, prefix: 'in:' | 'out:', handle?: string) {
    const data = this.nodes.find((node) => node.id === nodeId)?.data();
    return data?.kind === 'entity' ? data.fields.find((field) => prefix + field.id === handle) : undefined;
  }
}

function frame(id: string, point: { x: number; y: number }, title: string, height: number) {
  return { id, point, width: 728, height, ariaLabel: title, data: { kind: 'frame' as const, title } };
}

function entity(
  id: string,
  parentId: string,
  point: { x: number; y: number },
  title: string,
  category: string,
  fields: [string, string, string, string?][],
) {
  return {
    id,
    parentId,
    point,
    ariaLabel: `${title} ${category === 'table' ? 'entity' : category.toLowerCase() + ' schema'}`,
    data: {
      kind: 'entity' as const,
      title,
      category,
      fields: fields.map(([fieldId, name, type, key = '']) => ({ id: fieldId, name, type, key })),
    },
  };
}
