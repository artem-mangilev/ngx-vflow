import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Vui } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  Edge,
  Node,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';

interface EntityData {
  title: string;
  category: string;
  fields: { id: string; name: string; type: string; key: string }[];
}

@Component({
  selector: 'app-ui-entities-demo',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    article {
      width: 250px;
    }
    vflow {
      height: 560px;
    }
    .key {
      min-width: 22px;
      color: var(--vui-accent);
      font-size: 11px;
    }
    .remove {
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
  `,
  template: `
    <section
      class="demo"
      aria-label="Entity relationships and field mapping demo"
      [vuiTheme]="dark() ? 'dark' : 'light'"
      [style.--vui-space]="compact() ? '3px' : '4px'">
      <div class="controls">
        <button vuiButton type="button" (click)="flow()?.fitView()">Fit entities</button>
        <button vuiButton type="button" (click)="reverseFields()">Reverse fields</button>
        <button vuiButton type="button" (click)="renameField()">Rename email</button>
        <button vuiButton type="button" (click)="toggleLongNames()">Long names</button>
        <label><input type="checkbox" [checked]="compact()" (change)="compact.set(!compact())" /> Compact</label>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>Connect matching field types; names and row order can change.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges()" [connection]="connection" (connect)="connect($event)">
        <ng-template let-ctx vNode>
          <article
            vuiNode
            vSelectable
            [vuiSelected]="ctx.selected() || ctx.preselected()"
            [attr.data-entity]="ctx.node.id">
            <header vuiNodeHeader>
              <span vuiTitle>{{ ctx.data().title }}</span>
              <span vuiMeta>{{ ctx.data().category }}</span>
            </header>
            @for (field of ctx.data().fields; track field.id) {
              <div vuiField [attr.data-field]="field.id">
                <span vuiMeta class="key">{{ field.key }}</span>
                <span vuiTitle>{{ field.name }}</span>
                <span vuiMeta>{{ field.type }}</span>
                <button
                  vNoDrag
                  class="remove"
                  type="button"
                  [attr.aria-label]="'Delete ' + ctx.data().title + '.' + field.name"
                  (click)="deleteField(ctx.node.id, field.id)">
                  ×
                </button>
                <span
                  vuiPort
                  handleType="target"
                  position="left"
                  [handleId]="'in:' + field.id"
                  [vuiPortConnected]="connected().has(ctx.node.id + '/in:' + field.id)"></span>
                <span
                  vuiPort
                  handleType="source"
                  position="right"
                  [handleId]="'out:' + field.id"
                  [vuiPortConnected]="connected().has(ctx.node.id + '/out:' + field.id)"></span>
              </div>
            }
          </article>
        </ng-template>
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteraction>
            <svg:path vuiEdge [attr.d]="ctx.path()" [vuiSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
          @if (ctx.data()?.label; as label) {
            <span *vEdgeLabel vuiEdgeLabel>
              {{ label }}
              <button
                vNoDrag
                class="remove"
                type="button"
                [attr.aria-label]="'Remove ' + label + ' connection'"
                (click)="removeEdge(ctx.edge.id)">
                ×
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
  readonly dark = signal(true);
  readonly compact = signal(false);
  readonly longNames = signal(false);
  readonly nodes = createNodes<EntityData>([
    {
      id: 'customer',
      point: { x: 30, y: 30 },
      ariaLabel: 'Customer entity',
      data: {
        title: 'Customer',
        category: 'ERD',
        fields: [
          { id: 'id', name: 'id', type: 'uuid', key: 'PK' },
          { id: 'email', name: 'email', type: 'text', key: '' },
          { id: 'name', name: 'name', type: 'text', key: '' },
        ],
      },
    },
    {
      id: 'order',
      point: { x: 460, y: 30 },
      ariaLabel: 'Order entity',
      data: {
        title: 'Order',
        category: 'ERD',
        fields: [
          { id: 'id', name: 'id', type: 'uuid', key: 'PK' },
          { id: 'customer-id', name: 'customer_id', type: 'uuid', key: 'FK' },
          { id: 'total', name: 'total', type: 'decimal', key: '' },
        ],
      },
    },
    {
      id: 'crm',
      point: { x: 30, y: 290 },
      ariaLabel: 'CRM source schema',
      data: {
        title: 'CRM contact',
        category: 'Source',
        fields: [
          { id: 'email', name: 'email', type: 'text', key: '' },
          { id: 'name', name: 'full_name', type: 'text', key: '' },
        ],
      },
    },
    {
      id: 'erp',
      point: { x: 460, y: 290 },
      ariaLabel: 'ERP target schema',
      data: {
        title: 'ERP contact',
        category: 'Target',
        fields: [
          { id: 'email', name: 'contact_email', type: 'text', key: '' },
          { id: 'name', name: 'display_name', type: 'text', key: '' },
        ],
      },
    },
  ]) as (Node<EntityData> & { data: WritableSignal<EntityData> })[];
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
      const source = this.nodes
        .find((n) => n.id === c.source)
        ?.data()
        ?.fields.find((f) => 'out:' + f.id === c.sourceHandle);
      const target = this.nodes
        .find((n) => n.id === c.target)
        ?.data()
        ?.fields.find((f) => 'in:' + f.id === c.targetHandle);
      return !!source && !!target && source.type === target.type;
    },
  };

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }

  reverseFields() {
    this.nodes.forEach((node) => node.data.update((data) => ({ ...data, fields: [...data.fields].reverse() })));
  }

  /** Long identifiers wrap inside the row; endpoints must stay on the rows. */
  toggleLongNames() {
    const long = !this.longNames();
    this.longNames.set(long);
    const erp = this.nodes.find((node) => node.id === 'erp')!;
    erp.data.update((data) => ({
      ...data,
      fields: data.fields.map((field) => ({
        ...field,
        name: long
          ? `${field.name}_of_the_primary_business_contact_record`
          : field.name.replace('_of_the_primary_business_contact_record', ''),
      })),
    }));
  }

  renameField() {
    const crm = this.nodes.find((node) => node.id === 'crm')!;
    crm.data.update((data) => ({
      ...data,
      fields: data.fields.map((field) =>
        field.id === 'email' ? { ...field, name: field.name === 'email' ? 'primary_email' : 'email' } : field,
      ),
    }));
  }

  connect(connection: Connection) {
    const edge = createEdge({
      ...connection,
      id: crypto.randomUUID(),
      data: { label: 'Mapping' },
    });
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  /** Deleting a field is an application decision: its edges go with it, nothing is left detached. */
  deleteField(nodeId: string, fieldId: string) {
    const node = this.nodes.find((entity) => entity.id === nodeId)!;
    node.data.update((data) => ({ ...data, fields: data.fields.filter((field) => field.id !== fieldId) }));
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
}
