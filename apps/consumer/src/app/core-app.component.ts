import { ChangeDetectionStrategy, Component } from '@angular/core';
import { addEdges, Connection, createEdges, createNodes, Edge, Vflow } from 'ngx-vflow';

@Component({
  selector: 'app-root',
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
    .line {
      fill: none;
      stroke: var(--vflow-muted, rgb(177, 177, 183));
      stroke-width: 2;
    }
    .card {
      width: 160px;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #fff;
    }
    .dot {
      width: 12px;
      height: 12px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 2px solid #fff;
      background: #333;
    }
  `,
  template: `
    <vflow view="auto" data-testid="core-flow" [nodes]="nodes" [edges]="edges" (connect)="createEdge($event)">
      <ng-template let-ctx node>
        <div class="card" selectable>
          {{ ctx.data().title }}
          <span vflowHandle handleType="target" position="left" class="dot"></span>
          <span vflowHandle handleType="source" position="right" class="dot"></span>
        </div>
      </ng-template>
      <ng-template let-ctx edge>
        <svg:g edgeInteraction>
          <svg:path class="line" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
        </svg:g>
      </ng-template>
      <mini-map />
    </vflow>
  `,
})
export class CoreAppComponent {
  readonly nodes = createNodes([
    { id: 'a', point: { x: 40, y: 60 }, data: { title: 'Own template' } },
    { id: 'b', point: { x: 320, y: 160 }, data: { title: 'No UI package' } },
    { id: 'c', point: { x: 320, y: 20 }, data: { title: 'Third card' } },
  ]);
  edges: Edge[] = createEdges([
    { id: 'a-b', source: 'a', target: 'b', markers: { end: {} } },
    { id: 'a-c', source: 'a', target: 'c' },
  ]);

  createEdge(connection: Connection) {
    this.edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges: this.edges });
  }
}
