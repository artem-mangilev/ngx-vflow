import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { StaticEdge, StaticNode, Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  // The whole graph is far too large to fit, and a view of all of it would leave virtualization nothing to hide.
  // So the first view is the middle of the graph, zoomed out only as far as its nodes stay recognizable.
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges"
    [minZoom]="0.1"
    [virtualization]="true"
    (initialized)="flow.fitView({ minZoom: 0.55 })">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class VirtualizationDemoComponent {
  private readonly graph = createPipelines(70, 70);

  protected readonly nodes = this.graph.nodes;
  protected readonly edges = this.graph.edges;
}

/** `count` pipelines of `steps` nodes each, one pipeline per row: 4900 nodes for 70 by 70. */
function createPipelines(count: number, steps: number) {
  const nodes: StaticNode<{ text: string }>[] = [];
  const edges: StaticEdge[] = [];

  for (let pipeline = 0; pipeline < count; pipeline++) {
    for (let step = 0; step < steps; step++) {
      const id = `${pipeline}-${step}`;
      nodes.push({
        id,
        point: { x: step * 150, y: pipeline * 100 },
        data: { text: `Step ${pipeline + 1}.${step + 1}` },
      });

      if (step > 0) {
        const previous = `${pipeline}-${step - 1}`;
        edges.push({ id: `${previous}>${id}`, source: previous, target: id });
      }
    }
  }

  return { nodes: createNodes(nodes), edges: createEdges(edges) };
}
