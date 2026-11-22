import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoIconComponent, DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

interface LongEntity {
  title: string;
  collapsed: boolean;
  fields: { id: string; name: string; type: string }[];
}

/**
 * Endpoints of hidden rows. Collapse is an application policy, not a library contract: every endpoint moves to a
 * proxy handle in the header. Scroll needs no code: core keeps the endpoint of a row scrolled out of view on the
 * border of the scroll box.
 */
/**
 * Free ports show on interaction, connected ones always: an idle port without an edge is invisible, though still a
 * target, until its table is hovered, focused or selected. The table host is an element of core, so its state is read
 * from the port itself. Proxy ports on the header share one point: connected ones are visually merged.
 */
const QUIET_PORT = `transition-[border-color,background-color,box-shadow,opacity]!
  [&[data-v-handle-state=idle]:not([data-vui-connected=true]):not([data-v-node]:hover_*,[data-v-node]:focus-within_*,[data-v-selected]_*,[data-v-preselected]_*)]:opacity-0
  forced-colors:opacity-100! [header>&]:data-[vui-connected=true]:opacity-60`;

@Component({
  selector: 'app-ui-scroll-collapse-demo',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <docs-demo framed role="region" aria-label="Scroll and collapse experiment">
      <div class="h-105">
        <vflow
          #flow
          [nodes]="nodes"
          [edges]="edges"
          [background]="background"
          (initialized)="flow.fitView({ maxZoom: 1 })">
          <ng-template let-ctx vNode [vNodeOf]="nodes">
            <article
              vuiNode
              class="w-60 text-[14px]"
              [attr.data-entity]="ctx.node.id"
              [attr.data-collapsed]="ctx.data().collapsed">
              <header vuiNodeHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
                <span vuiMeta>{{ ctx.data().fields.length }} fields</span>
                <button
                  docsButton="plain"
                  small
                  icon
                  vNoDrag
                  vNoSelect
                  type="button"
                  [attr.aria-label]="(ctx.data().collapsed ? 'Expand ' : 'Collapse ') + ctx.data().title"
                  [attr.aria-expanded]="!ctx.data().collapsed"
                  (click)="toggle(ctx.node.id)">
                  <app-demo-icon [name]="ctx.data().collapsed ? 'chevron-right' : 'chevron-down'" />
                </button>
                <!-- Proxy handles keep the same IDs, so edges stay attached while rows are hidden. -->
                @if (ctx.data().collapsed) {
                  @for (field of ctx.data().fields; track field.id) {
                    <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                  }
                }
              </header>
              <ng-template #ports let-field>
                <span
                  vuiPort
                  handleType="target"
                  position="left"
                  [class]="quietPort"
                  [handleId]="'in:' + field.id"
                  [vuiPortConnected]="connected.has(ctx.node.id + '/in:' + field.id)"
                  [canStart]="false"></span>
                <span
                  vuiPort
                  handleType="source"
                  position="right"
                  [class]="quietPort"
                  [handleId]="'out:' + field.id"
                  [vuiPortConnected]="connected.has(ctx.node.id + '/out:' + field.id)"
                  [canAccept]="false"></span>
              </ng-template>
              @if (!ctx.data().collapsed) {
                <div class="max-h-37.5 overflow-y-auto overscroll-contain" vNoWheel [attr.data-rows]="ctx.node.id">
                  @for (field of ctx.data().fields; track field.id) {
                    <div vuiRow [attr.data-field]="field.id">
                      <span vuiTitle>{{ field.name }}</span>
                      <span vuiMeta>{{ field.type }}</span>
                      <ng-container *ngTemplateOutlet="ports; context: { $implicit: field }" />
                    </div>
                  }
                </div>
              }
            </article>
          </ng-template>
          <svg:g *vEdge="let ctx">
            <svg:path vuiEdge [attr.d]="ctx.path()" />
          </svg:g>
          <vui-controls vPanel="bottom-left" />
        </vflow>
      </div>
    </docs-demo>
  `,
})
export class ScrollCollapseDemoComponent {
  protected readonly background = SCENE_BACKGROUND;
  protected readonly quietPort = QUIET_PORT;
  protected readonly nodes = createNodes<LongEntity>([
    {
      id: 'product',
      point: { x: 0, y: 0 },
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
      point: { x: 400, y: 240 },
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
      point: { x: 400, y: 40 },
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
  ]);
  protected readonly edges = createEdges([
    {
      id: 'supplier',
      source: 'product',
      sourceHandle: 'out:supplier-id',
      target: 'supplier',
      targetHandle: 'in:id',
    },
    {
      id: 'brand',
      source: 'product',
      sourceHandle: 'out:brand-id',
      target: 'brand',
      targetHandle: 'in:id',
    },
  ]);
  /** `${nodeId}/${handleId}` for every endpoint of an edge; proxies carry the same IDs, so they count too. */
  protected readonly connected = new Set(
    this.edges.flatMap((edge) => [`${edge.source}/${edge.sourceHandle}`, `${edge.target}/${edge.targetHandle}`]),
  );

  protected toggle(id: string) {
    this.nodes.find((node) => node.id === id)!.data.update((data) => ({ ...data, collapsed: !data.collapsed }));
  }
}
