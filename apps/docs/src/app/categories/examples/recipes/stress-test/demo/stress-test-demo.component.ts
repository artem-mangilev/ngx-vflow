import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Edge, StaticNode, Vflow, createNodes } from 'ngx-vflow';
import { StressTestNodeComponent } from './stress-test-node.component';

@Component({
  // The first view shows the whole grid, which takes a zoom far below the default `minZoom`.
  template: `<vflow
    #flow
    [nodes]="graph.nodes"
    [edges]="graph.edges"
    [minZoom]="0.1"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    <vui-controls vPanel="bottom-left" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class StressTestDemoComponent {
  protected readonly graph = createChain(40, 50);
}

/** A queue of jobs laid out as a grid, each one waiting for the one before it. */
function createChain(columns: number, rows: number) {
  const nodes: StaticNode<{ label: string }>[] = [];
  // Plain edges: an edge needs no signals for what it never changes.
  const edges: Edge[] = [];

  for (let index = 0; index < columns * rows; index++) {
    const label = `Job ${index + 1}`;

    nodes.push({
      id: `job-${index + 1}`,
      component: StressTestNodeComponent,
      point: { x: (index % columns) * 150, y: Math.floor(index / columns) * 100 },
      data: { label },
      ariaLabel: label,
    });

    if (index > 0) {
      edges.push({ id: `job-${index}-${index + 1}`, source: `job-${index}`, target: `job-${index + 1}` });
    }
  }

  return { nodes: createNodes(nodes), edges };
}
