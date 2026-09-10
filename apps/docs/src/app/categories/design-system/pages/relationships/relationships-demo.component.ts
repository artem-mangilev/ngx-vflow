import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-relationships-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../demo.css'],
  styles: `
    article {
      width: 210px;
    }
    .frame {
      width: 510px;
      height: 270px;
    }
    .bars {
      display: flex;
      align-items: end;
      gap: 6px;
      height: 70px;
    }
    .bars span {
      width: 25px;
      background: var(--vui-accent);
    }
    .metric {
      font-size: 28px;
      font-weight: 700;
    }
    .note {
      background: var(--vui-surface-muted);
    }
  `,
  template: `
    <section class="demo" aria-label="Relationships and metrics demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>View-only metrics map. Pan, zoom and select; graph editing is unavailable.</p>
      </div>
      @if (flow(); as editor) {
        <vflow-controls [flow]="editor"
          ><button vflowButton type="button" (click)="refresh()">Refresh metrics</button></vflow-controls
        >
      }
      <vflow view="auto" [nodes]="nodes" [edges]="edges">
        <mini-map [pannable]="true" [zoomable]="true" />
        <ng-template let-ctx nodeHtml>
          @if (ctx.node.id === 'team') {
            <div vflowGroup class="frame" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
              <header vflowGroupHeader>Platform team · container with its own connection</header>
              <handle
                type="source"
                position="right"
                id="team-output"
                [template]="port"
                [canStart]="false"
                [canAccept]="false" />
            </div>
          } @else {
            <article
              vflowNode
              selectable
              [class.note]="ctx.node.id === 'note'"
              [vflowSelected]="ctx.selected() || ctx.preselected()">
              <header vflowNodeHeader>{{ ctx.data().title }}</header>
              <div vflowNodeBody>
                @if (ctx.node.id === 'note') {
                  <p>No ports on this note. Counts are a static application fixture, not telemetry.</p>
                } @else if (ctx.node.id === 'latency') {
                  <p class="metric">{{ latency() }} ms</p>
                  <div class="bars" role="img" aria-label="Latency trend: 45, 60, 40, 35 milliseconds">
                    <span style="height:45px"></span><span style="height:60px"></span><span style="height:40px"></span
                    ><span style="height:35px"></span>
                  </div>
                } @else {
                  <p class="metric">99.95%</p>
                  <span vflowStatus="success">Healthy</span>
                }
              </div>
              @if (ctx.node.id === 'service') {
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
              }
            </article>
          }
        </ng-template>
        <ng-template let-ctx edge
          ><svg:g customTemplateEdge selectable>
            <svg:path vflowEdge [attr.d]="ctx.path()" [vflowSelected]="ctx.selected() || ctx.preselected()" /></svg:g
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
  readonly dark = signal(true);
  readonly latency = signal(35);
  readonly nodes = createNodes([
    {
      id: 'team',
      type: 'html-template',
      point: { x: 20, y: 20 },
      draggable: false,
      ariaLabel: 'Platform team container',
      data: { title: 'Platform team' },
    },
    {
      id: 'latency',
      type: 'html-template',
      point: { x: 20, y: 60 },
      parentId: 'team',
      draggable: false,
      ariaLabel: 'Latency metric',
      data: { title: 'API latency' },
    },
    {
      id: 'note',
      type: 'html-template',
      point: { x: 270, y: 60 },
      parentId: 'team',
      draggable: false,
      ariaLabel: 'Dashboard note',
      data: { title: 'Reading this map' },
    },
    {
      id: 'service',
      type: 'html-template',
      point: { x: 710, y: 80 },
      draggable: false,
      ariaLabel: 'Payments service health',
      data: { title: 'Payments service' },
    },
  ]);
  readonly edges = createEdges([
    {
      id: 'ownership',
      type: 'template',
      source: 'team',
      sourceHandle: 'team-output',
      target: 'service',
      edgeLabels: { center: { type: 'html-template', data: 'owns' } },
    },
  ]);
  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
  refresh() {
    this.latency.update((value) => (value === 35 ? 42 : 35));
  }
}
