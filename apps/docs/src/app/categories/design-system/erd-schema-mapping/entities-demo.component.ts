import { ChangeDetectionStrategy, Component, computed, signal, viewChild, WritableSignal } from '@angular/core';
import { Vui } from '@vflow/ui';
import { DemoIconComponent } from '../../../shared/demo-icon.component';
import { injectDocsTheme } from '../../../shared/docs-theme';
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

@Component({
  selector: 'app-ui-entities-demo',
  imports: [Vflow, Vui, DemoIconComponent],
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
            <article vuiNode [selected]="ctx.selected() || ctx.preselected()" [attr.data-entity]="ctx.node.id">
              <header vuiNodeHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
                <span vuiMeta>{{ ctx.data().category }}</span>
              </header>
              @for (field of ctx.data().fields; track field.id) {
                <div vuiRow [attr.data-field]="field.id">
                  <span vuiMeta class="key">{{ field.key }}</span>
                  <span vuiTitle>{{ field.name }}</span>
                  <span vuiMeta>{{ field.type }}</span>
                  <button
                    class="button plain small icon row-action"
                    vNoDrag
                    type="button"
                    [attr.aria-label]="'Delete ' + ctx.data().title + '.' + field.name"
                    (click)="deleteField(ctx.node.id, field.id)">
                    <app-demo-icon name="close" />
                  </button>
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
                </div>
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
  readonly nodes = createNodes<SchemaData>([
    frame('relationships', { x: 0, y: 0 }, 'Relationships', 238),
    frame('mapping', { x: 0, y: 290 }, 'Field mapping', 200),
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
    this.edges.update((edges) =>
      edges.filter(
        (edge) =>
          !(edge.source === nodeId && edge.sourceHandle === 'out:' + fieldId) &&
          !(edge.target === nodeId && edge.targetHandle === 'in:' + fieldId),
      ),
    );
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
