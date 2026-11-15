import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `
    <div class="bar">
      <button type="button" (click)="flow.fitView({ duration: 300 })">Fit view</button>
      <button type="button" (click)="flow.fitView({ nodes: ['3'], padding: 1, duration: 300 })">Fit node 3</button>
      <button type="button" (click)="flow.zoomIn({ duration: 150 })">Zoom in</button>
      <button type="button" (click)="flow.zoomOut({ duration: 150 })">Zoom out</button>
      <button type="button" (click)="flow.setCenter({ x: 0, y: 0 }, { zoom: 1, duration: 300 })">Center on 0, 0</button>
      <output>{{ (flow.viewport().zoom * 100).toFixed(0) }}%</output>
    </div>

    <vflow #flow [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }" (initialized)="flow.fitView()">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 8px 48px 8px 8px;
    }

    output {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }

    vflow {
      flex: 1;
      min-height: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class ViewportControlDemoComponent {
  protected readonly nodes: Node[] = createNodes([
    { id: '1', point: { x: 0, y: 0 }, data: { text: '1' } },
    { id: '2', point: { x: 260, y: 120 }, data: { text: '2' } },
    { id: '3', point: { x: 620, y: 360 }, data: { text: '3' } },
  ]);

  protected readonly edges: Edge[] = [
    { id: '1 -> 2', source: '1', target: '2' },
    { id: '2 -> 3', source: '2', target: '3' },
  ];
}
