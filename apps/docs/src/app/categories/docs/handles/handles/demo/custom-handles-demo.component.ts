import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Connection, Edge, Vflow, addEdges, createEdges, createNodes } from 'ngx-vflow';
import { SquareHandleComponent } from './square-handle.component';

/**
 * The look of a plain element with `vHandle`: a dot that follows the attributes core reflects on the handle. In the
 * auto layout the directive owns `transform`, so the hover effect uses the `scale` property.
 */
const DOT = `size-3 rounded-full bg-vui-foreground transition-[scale] hover:scale-125
  data-[v-handle-state=valid]:bg-vui-success data-[v-handle-state=invalid]:bg-vui-danger
  data-[v-handle-can-start=false]:opacity-40 data-[v-handle-can-start=false]:hover:scale-100`;

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label>
        <input
          type="checkbox"
          [checked]="temperatureCanStart()"
          (change)="temperatureCanStart.set(!temperatureCanStart())" />
        Temperature can start connections
      </label>
      <label>
        <input type="checkbox" [checked]="chartCanAccept()" (change)="chartCanAccept.set(!chartCanAccept())" />
        Chart can accept connections
      </label>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      (connect)="connect($event)"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <ng-template let-ctx vNode>
        @if (ctx.node.id === 'sensor') {
          <!-- Plain elements as handles: the classes read the data-v-handle attributes. -->
          <article vuiNode class="w-44 text-[13px]">
            <header vuiNodeHeader><span vuiTitle>Sensor</span></header>
            <div vuiRow>
              Temperature
              <span
                vHandle
                handleType="source"
                position="right"
                handleId="temperature"
                [class]="dot"
                [canStart]="temperatureCanStart()"></span>
            </div>
            <div vuiRow>
              Humidity
              <span vHandle handleType="source" position="right" handleId="humidity" [class]="dot"></span>
            </div>
          </article>
        } @else {
          <!-- A component that is a handle: see square-handle.component.ts. -->
          <article vuiNode class="w-44 text-[13px]">
            <header vuiNodeHeader><span vuiTitle>Dashboard</span></header>
            <div vuiRow>
              Chart
              <square-handle handleType="target" position="left" handleId="chart" [canAccept]="chartCanAccept()" />
            </div>
            <div vuiRow>
              Alert
              <square-handle handleType="target" position="left" handleId="alert" />
            </div>
          </article>
        }
      </ng-template>

      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui, SquareHandleComponent],
})
export class CustomHandlesDemoComponent {
  protected readonly dot = DOT;

  protected readonly temperatureCanStart = signal(true);
  protected readonly chartCanAccept = signal(true);

  protected readonly nodes = createNodes([
    { id: 'sensor', point: { x: 0, y: 0 } },
    { id: 'dashboard', point: { x: 320, y: 40 } },
  ]);

  protected readonly edges = signal<Edge[]>(
    createEdges([
      { id: 'humidity-alert', source: 'sensor', sourceHandle: 'humidity', target: 'dashboard', targetHandle: 'alert' },
    ]),
  );

  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }
}
