import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, HtmlTemplateNode, Vflow, VflowComponent } from 'ngx-vflow';

interface LongEntity {
  title: string;
  collapsed: boolean;
  fields: { id: string; name: string; type: string }[];
}

interface Visibility {
  /** Field IDs whose rows are at least partly visible in the scroll box. */
  visible: Set<string>;
  above: string[];
  below: string[];
  /** Changes on every scroll so visible rows are re-created and their handles re-measured. */
  key: number;
}

const ALL_VISIBLE: Visibility = { visible: new Set(), above: [], below: [], key: 0 };

/**
 * Local experiment, not a library contract. Two application policies for hidden endpoints:
 * - collapse moves every endpoint to proxy handles in the header;
 * - scroll keeps visible rows' handles on the rows and moves hidden ones to the nearest border
 *   (header or footer). Core measures handles after render and resize, not on scroll, so visible
 *   rows are re-created on scroll to be measured again.
 */
@Component({
  selector: 'app-ui-scroll-collapse-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    article {
      width: 240px;
    }
    vflow {
      height: 420px;
    }
    .rows {
      max-height: 150px;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .toggle {
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
    }
    .edge-note {
      min-height: 20px;
      padding-block: 4px;
    }
    /* Proxy handles share one point per border; their ports are visually merged. */
    .proxy .vui-port {
      opacity: 0.6;
    }
  `,
  template: `
    <section class="demo" aria-label="Scroll and collapse experiment" vflowTheme="light">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit</button>
        <p>Scroll the Product rows with the wheel; collapse a node to move its endpoints to the header.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx nodeHtml>
          @let view = visibility(ctx.node.id);
          <article
            vflowNode
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [attr.data-entity]="ctx.node.id"
            [attr.data-collapsed]="ctx.data().collapsed">
            <header vflowNodeHeader [class.proxy]="ctx.data().collapsed || view.above.length">
              <span vflowTitle>{{ ctx.data().title }}</span>
              <span vflowMeta>{{ ctx.data().fields.length }} fields</span>
              <button
                vflowNoDrag
                class="toggle"
                type="button"
                [attr.aria-label]="(ctx.data().collapsed ? 'Expand ' : 'Collapse ') + ctx.data().title"
                [attr.aria-expanded]="!ctx.data().collapsed"
                (click)="toggle(ctx.node.id)">
                {{ ctx.data().collapsed ? '▸' : '▾' }}
              </button>
              <!-- Proxy handles keep the same IDs, so edges stay attached while rows are hidden. -->
              @for (
                field of ctx.data().collapsed ? ctx.data().fields : hidden(ctx.data(), view.above);
                track field.id
              ) {
                <handle type="target" position="left" [id]="'in:' + field.id" [template]="port" [canStart]="false" />
                <handle type="source" position="right" [id]="'out:' + field.id" [template]="port" [canAccept]="false" />
              }
            </header>
            @if (!ctx.data().collapsed) {
              <div class="rows" vflowNoWheel [attr.data-rows]="ctx.node.id" (scroll)="onScroll(ctx.node.id, $event)">
                @for (row of rows(ctx.node.id, ctx.data()); track row.key) {
                  <div vflowField [attr.data-field]="row.field.id">
                    <span vflowTitle>{{ row.field.name }}</span>
                    <span vflowMeta>{{ row.field.type }}</span>
                    @if (row.handles) {
                      <handle
                        type="target"
                        position="left"
                        [id]="'in:' + row.field.id"
                        [template]="port"
                        [canStart]="false" />
                      <handle
                        type="source"
                        position="right"
                        [id]="'out:' + row.field.id"
                        [template]="port"
                        [canAccept]="false" />
                    }
                  </div>
                }
              </div>
              @if (view.below.length) {
                <footer vflowNodeFooter class="proxy edge-note">
                  <span vflowMeta>{{ view.below.length }} more below</span>
                  @for (field of hidden(ctx.data(), view.below); track field.id) {
                    <handle
                      type="target"
                      position="left"
                      [id]="'in:' + field.id"
                      [template]="port"
                      [canStart]="false" />
                    <handle
                      type="source"
                      position="right"
                      [id]="'out:' + field.id"
                      [template]="port"
                      [canAccept]="false" />
                  }
                </footer>
              }
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
})
export class ScrollCollapseDemoComponent {
  readonly flow = viewChild(VflowComponent);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly views = signal<Record<string, Visibility>>({});
  private readonly lastTop: Record<string, number> = {};
  readonly nodes = createNodes<LongEntity>([
    {
      id: 'product',
      type: 'html-template',
      point: { x: 20, y: 20 },
      ariaLabel: 'Product entity',
      data: {
        title: 'Product',
        collapsed: false,
        fields: [
          ['id', 'uuid'],
          ['sku', 'text'],
          ['name', 'text'],
          ['brand-id', 'uuid'],
          ['category-id', 'uuid'],
          ['price', 'decimal'],
          ['currency', 'text'],
          ['weight', 'decimal'],
          ['created-at', 'timestamp'],
          ['updated-at', 'timestamp'],
          ['supplier-id', 'uuid'],
          ['status', 'text'],
        ].map(([id, type]) => ({ id, name: id.replace('-', '_'), type })),
      },
    },
    {
      id: 'supplier',
      type: 'html-template',
      point: { x: 420, y: 60 },
      ariaLabel: 'Supplier entity',
      data: {
        title: 'Supplier',
        collapsed: false,
        fields: [
          { id: 'id', name: 'id', type: 'uuid' },
          { id: 'name', name: 'name', type: 'text' },
        ],
      },
    },
    {
      id: 'brand',
      type: 'html-template',
      point: { x: 420, y: 260 },
      ariaLabel: 'Brand entity',
      data: {
        title: 'Brand',
        collapsed: false,
        fields: [
          { id: 'id', name: 'id', type: 'uuid' },
          { id: 'name', name: 'name', type: 'text' },
        ],
      },
    },
  ]) as (HtmlTemplateNode<LongEntity> & { data: WritableSignal<LongEntity> })[];
  readonly edges = createEdges([
    {
      id: 'supplier',
      source: 'product',
      sourceHandle: 'out:supplier-id',
      target: 'supplier',
      targetHandle: 'in:id',
      type: 'template',
    },
    {
      id: 'brand',
      source: 'product',
      sourceHandle: 'out:brand-id',
      target: 'brand',
      targetHandle: 'in:id',
      type: 'template',
    },
  ]);

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
    // Classify each scroll box once it exists, so hidden rows start on the borders as well.
    afterEveryRender(() => {
      for (const box of Array.from(this.host.querySelectorAll<HTMLElement>('[data-rows]'))) {
        const id = box.dataset['rows']!;
        if (!(id in this.lastTop)) this.classify(id, box);
      }
    });
  }

  visibility(nodeId: string): Visibility {
    return this.views()[nodeId] ?? ALL_VISIBLE;
  }

  /** Rows with a key that changes on scroll for visible rows, so they are re-created and measured again. */
  rows(nodeId: string, data: LongEntity) {
    const view = this.visibility(nodeId);
    return data.fields.map((field) => {
      const handles = view.key === 0 || view.visible.has(field.id);
      return { field, handles, key: `${field.id}:${handles ? view.key : 0}` };
    });
  }

  hidden(data: LongEntity, ids: string[]) {
    return data.fields.filter((field) => ids.includes(field.id));
  }

  toggle(id: string) {
    this.nodes.find((node) => node.id === id)!.data.update((data) => ({ ...data, collapsed: !data.collapsed }));
    delete this.lastTop[id];
    this.views.update((views) => ({ ...views, [id]: ALL_VISIBLE }));
  }

  onScroll(nodeId: string, event: Event) {
    this.classify(nodeId, event.target as HTMLElement);
  }

  /** Classify rows by their position in the scroll box; the application decides where hidden endpoints go. */
  private classify(nodeId: string, box: HTMLElement) {
    const top = box.scrollTop;
    // Re-creating rows can emit scroll events; only a real scroll offset change re-classifies.
    if (this.lastTop[nodeId] === top) return;
    this.lastTop[nodeId] = top;
    const frame = box.getBoundingClientRect();
    const visible = new Set<string>();
    const above: string[] = [];
    const below: string[] = [];
    for (const row of Array.from(box.querySelectorAll<HTMLElement>('[data-field]'))) {
      const id = row.dataset['field']!;
      const rect = row.getBoundingClientRect();
      if (rect.bottom <= frame.top) above.push(id);
      else if (rect.top >= frame.bottom) below.push(id);
      else visible.add(id);
    }
    this.views.update((views) => ({
      ...views,
      [nodeId]: { visible, above, below, key: (views[nodeId]?.key ?? 0) + 1 },
    }));
  }
}
