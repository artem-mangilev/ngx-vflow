import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { VflowUi } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  Edge,
  HtmlTemplateNode,
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
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../demo.css'],
  styles: `
    article {
      width: 250px;
    }
    vflow {
      height: 560px;
    }
    [vflowField] {
      min-height: 42px;
    }
    .compact [vflowField] {
      min-height: 28px;
    }
    .experiment .fields {
      max-height: 48px;
      overflow-y: auto;
    }
    .collapsed .fields {
      display: none;
    }
    .field-name {
      overflow-wrap: anywhere;
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
      [vflowTheme]="dark() ? 'dark' : 'light'"
      [class.compact]="compact()"
      [class.experiment]="experiment()"
      [class.collapsed]="collapsed()">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit entities</button>
        <button vflowButton type="button" (click)="reverseFields()">Reverse fields</button>
        <button vflowButton type="button" (click)="renameField()">Rename email</button>
        <label><input type="checkbox" [checked]="compact()" (change)="compact.set(!compact())" /> Compact</label>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <button vflowButton type="button" [disabled]="emailDeleted()" (click)="deleteEmail()">
          Delete CRM email field
        </button>
        <label
          ><input type="checkbox" [checked]="experiment()" (change)="experiment.set(!experiment())" /> Scroll
          experiment</label
        >
        <label
          ><input type="checkbox" [checked]="collapsed()" (change)="collapsed.set(!collapsed())" /> Collapse
          experiment</label
        >
        <p>Connect matching field types; names and row order can change.</p>
        @if (experiment() || collapsed()) {
          <p role="status">
            Experiment: hidden endpoints retain stale geometry; scroll/collapse is not supported by the library.
          </p>
        }
      </div>
      @if (flow(); as editor) {
        <vflow-controls [flow]="editor" />
      }
      <vflow view="auto" [nodes]="nodes" [edges]="edges()" [connection]="connection" (connect)="connect($event)">
        <ng-template let-ctx nodeHtml>
          <article
            vflowNode
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [attr.data-entity]="ctx.node.id">
            <header vflowNodeHeader>
              <span class="grow">{{ ctx.data().title }}</span>
              <span class="muted">{{ ctx.data().category }}</span>
            </header>
            <div class="fields" vflowNoWheel vflowNoDrag>
              @for (field of ctx.data().fields; track field.id) {
                <div vflowField [attr.data-field]="field.id">
                  <span class="key">{{ field.key }}</span>
                  <span class="grow field-name">{{ field.name }}</span>
                  <span class="muted">{{ field.type }}</span>
                  <handle
                    type="target"
                    position="left"
                    [id]="'in:' + field.id"
                    [template]="port"
                    [ariaLabel]="ctx.data().title + '.' + field.name + ' input'" />
                  <handle
                    type="source"
                    position="right"
                    [id]="'out:' + field.id"
                    [template]="port"
                    [ariaLabel]="ctx.data().title + '.' + field.name + ' output'" />
                </div>
              }
            </div>
          </article>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
        <ng-template let-ctx connection>
          @if (ctx.path(); as path) {
            <svg:path vflowEdge stroke-dasharray="5 4" [attr.d]="path" />
          }
        </ng-template>
        <ng-template let-ctx edgeLabelHtml>
          <span vflowEdgeLabel>
            {{ ctx.label.data }}
            <button
              vflowNoDrag
              class="remove"
              type="button"
              [attr.aria-label]="'Remove ' + ctx.label.data + ' connection'"
              (click)="removeEdge(ctx.edge.id)">
              ×
            </button>
          </span>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
})
export class EntitiesDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(true);
  readonly compact = signal(false);
  readonly experiment = signal(false);
  readonly collapsed = signal(false);
  readonly emailDeleted = signal(false);
  readonly nodes = createNodes<EntityData>([
    {
      id: 'customer',
      type: 'html-template',
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
      type: 'html-template',
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
      type: 'html-template',
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
      type: 'html-template',
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
  ]) as (HtmlTemplateNode<EntityData> & { data: WritableSignal<EntityData> })[];
  readonly edges = signal<Edge[]>(
    createEdges([
      {
        id: 'foreign-key',
        source: 'customer',
        sourceHandle: 'out:id',
        target: 'order',
        targetHandle: 'in:customer-id',
        type: 'template',
        edgeLabels: { center: { type: 'html-template', data: '1 → N' } },
      },
      {
        id: 'email-mapping',
        source: 'crm',
        sourceHandle: 'out:email',
        target: 'erp',
        targetHandle: 'in:email',
        type: 'template',
        edgeLabels: { center: { type: 'html-template', data: 'Copy email' } },
      },
    ]),
  );
  readonly connection: ConnectionSettings = {
    type: 'template',
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
      type: 'template',
      edgeLabels: { center: { type: 'html-template', data: 'Mapping' } },
    });
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  deleteEmail() {
    // The application explicitly removes incident edges, rather than leaving detached connections.
    this.edges.update((edges) =>
      edges.filter(
        (edge) =>
          !(edge.source === 'crm' && edge.sourceHandle === 'out:email') &&
          !(edge.target === 'crm' && edge.targetHandle === 'in:email'),
      ),
    );
    this.nodes
      .find((node) => node.id === 'crm')!
      .data.update((data) => ({ ...data, fields: data.fields.filter((field) => field.id !== 'email') }));
    this.emailDeleted.set(true);
  }

  removeEdge(id: string) {
    this.edges.update((edges) => edges.filter((edge) => edge.id !== id));
  }
}
