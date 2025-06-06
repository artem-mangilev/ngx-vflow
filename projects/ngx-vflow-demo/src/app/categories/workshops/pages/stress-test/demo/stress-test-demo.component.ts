import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  templateUrl: './stress-test-demo.component.html',
  styleUrls: ['./stress-test-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class StressTestDemoComponent {
  public nodes: Node[] = [];
  public edges: Edge[] = [];

  constructor() {
    const { nodes, edges } = initialElements(32, 32);
    this.nodes = nodes;
    this.edges = edges;
  }
}

export function initialElements(xNodes = 10, yNodes = 10): { nodes: Node[]; edges: Edge[] } {
  const nodes = [] as Node[];
  const edges = [] as Edge[];

  let nodeId = 1;
  let recentNodeId = null;

  for (let y = 0; y < yNodes; y++) {
    for (let x = 0; x < xNodes; x++) {
      nodes.push({
        type: 'default',
        id: `stress-${nodeId}`,
        text: `Node ${nodeId}`,
        point: { x: x * 150, y: y * 100 },
      });

      if (recentNodeId && nodeId <= xNodes * yNodes) {
        edges.push({
          id: `${x}-${y}`,
          source: `stress-${recentNodeId}`,
          target: `stress-${nodeId}`,
        });
      }

      recentNodeId = nodeId;
      nodeId++;
    }
  }

  return { nodes, edges };
}
