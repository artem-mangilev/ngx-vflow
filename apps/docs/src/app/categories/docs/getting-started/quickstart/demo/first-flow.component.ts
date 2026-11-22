import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { addEdges, Connection, createNodes, Edge, Vflow } from 'ngx-vflow';

// Plain CSS with system colors on purpose: this is the code of the quickstart, which installs only ngx-vflow.
@Component({
  selector: 'app-first-flow',
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      (connect)="connect($event)"
      (initialized)="flow.fitView({ maxZoom: 1 })">
      <div *vNode="let ctx of nodes" class="step" [class.step--selected]="ctx.selected()">
        <span vHandle handleType="target" position="left" class="port"></span>
        {{ ctx.data().label }}
        <span vHandle handleType="source" position="right" class="port"></span>
      </div>

      <svg:g *vEdge="let ctx">
        <svg:path class="link" [class.link--selected]="ctx.selected()" [attr.d]="ctx.path()" />
      </svg:g>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      height: 320px;
    }

    .step {
      padding: 10px 16px;
      border: 1px solid GrayText;
      border-radius: 8px;
      background: Canvas;
      color: CanvasText;
      font-size: 14px;
    }

    .step--selected {
      border-color: Highlight;
      box-shadow: 0 0 0 1px Highlight;
    }

    .port {
      width: 10px;
      height: 10px;
      border: 1px solid GrayText;
      border-radius: 50%;
      background: Canvas;
    }

    .port[data-v-handle-state='valid'] {
      background: Highlight;
    }

    .link {
      fill: none;
      stroke: GrayText;
      stroke-width: 2;
    }

    .link--selected {
      stroke: Highlight;
    }
  `,
})
export class FirstFlowComponent {
  protected readonly nodes = createNodes([
    { id: 'fetch', point: { x: 40, y: 120 }, data: { label: 'Fetch orders' } },
    { id: 'filter', point: { x: 280, y: 60 }, data: { label: 'Keep unpaid' } },
    { id: 'remind', point: { x: 280, y: 180 }, data: { label: 'Send reminder' } },
  ]);

  protected readonly edges = signal<Edge[]>([{ id: 'fetch-filter', source: 'fetch', target: 'filter' }]);

  protected connect(connection: Connection): void {
    this.edges.update((edges) => addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges }));
  }
}
