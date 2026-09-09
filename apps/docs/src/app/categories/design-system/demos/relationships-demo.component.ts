import { ChangeDetectionStrategy, Component, effect, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-relationships-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./demo.css'],
  styles: `
    article {
      width: 180px;
    }
    .metric {
      font-size: 30px;
      font-weight: bold;
    }
    .bar {
      height: 10px;
      background: var(--vui-accent);
      margin-top: 8px;
    }
    .note {
      width: 220px;
      white-space: normal;
    }
  `,
  template: `
    <section class="demo" vflowTheme="light" aria-label="Read-only relationships map">
      <div class="controls">
        @if (flow(); as editor) {
          <vflow-controls [flow]="editor" />
        }
        <p>View only. The team frame has its own connection; its children use parent coordinates.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges" [nodesSelectable]="false" [edgesSelectable]="false">
        <mini-map />
        <ng-template let-ctx groupNode>
          <section vflowGroup [style.width.px]="ctx.width()" [style.height.px]="ctx.height()">
            <header vflowNodeHeader>{{ ctx.data().title }}</header>
            <handle type="source" position="right" [canStart]="false" [canAccept]="false" [template]="port" />
          </section>
        </ng-template>
        <ng-template let-ctx nodeHtml>
          <article vflowNode>
            <header vflowNodeHeader>{{ ctx.data().title }}</header>
            <div vflowNodeBody>
              @if (ctx.data().kind === 'note') {
                <p>Weekly metrics are supplied by the application. No editing is enabled in this map.</p>
              } @else {
                <div class="metric">{{ ctx.data().value }}</div>
                <div
                  class="bar"
                  role="img"
                  [style.width.%]="ctx.data().percent"
                  [attr.aria-label]="ctx.data().percent + ' percent of target'"></div>
              }
            </div>
            @if (ctx.node.id === 'org') {
              <handle type="target" position="left" [canStart]="false" [canAccept]="false" [template]="port" />
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge
          ><svg:g customTemplateEdge><svg:path vflowEdge [attr.d]="ctx.path()" /></svg:g
        ></ng-template>
        <ng-template let-ctx edgeLabelHtml
          ><span vflowEdgeLabel>{{ ctx.label.data }}</span></ng-template
        >
      </vflow>
      <ng-template #port handle><span vflowPort></span></ng-template>
    </section>
  `,
})
export class RelationshipsDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly nodes = createNodes(
    [
      {
        id: 'team',
        type: 'template-group' as const,
        point: { x: 20, y: 20 },
        width: 460,
        height: 230,
        ariaLabel: 'Platform team',
        data: { title: 'Platform team', kind: 'frame', value: '', percent: 0 },
      },
      {
        id: 'requests',
        type: 'html-template' as const,
        parentId: 'team',
        point: { x: 25, y: 75 },
        ariaLabel: 'Requests: 24 thousand',
        data: { title: 'Requests', kind: 'metric', value: '24k', percent: 75 },
      },
      {
        id: 'uptime',
        type: 'html-template' as const,
        parentId: 'team',
        point: { x: 245, y: 75 },
        ariaLabel: 'Uptime: 99.9 percent',
        data: { title: 'Uptime', kind: 'metric', value: '99.9%', percent: 99.9 },
      },
      {
        id: 'org',
        type: 'html-template' as const,
        point: { x: 650, y: 60 },
        ariaLabel: 'Organization: 3 teams',
        data: { title: 'Organization', kind: 'metric', value: '3 teams', percent: 60 },
      },
      {
        id: 'note',
        type: 'html-template' as const,
        point: { x: 210, y: 300 },
        ariaLabel: 'About these metrics',
        data: { title: 'About these metrics', kind: 'note', value: '', percent: 0 },
      },
    ].map((node) => ({ ...node, draggable: false })),
  );
  readonly edges = createEdges([
    {
      id: 'membership',
      type: 'template',
      source: 'team',
      target: 'org',
      edgeLabels: { center: { type: 'html-template' as const, data: 'Member of' } },
    },
  ]);
  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
}
