import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow, removeEdges, removeNodes } from 'ngx-vflow';

@Component({
  templateUrl: './delete-selected-demo.component.html',
  styleUrls: ['./delete-selected-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DeleteSelectedDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 150 }),
      type: 'html-template',
    },
    {
      id: '2',
      point: signal({ x: 290, y: 50 }),
      type: 'html-template',
    },
    {
      id: '3',
      point: signal({ x: 290, y: 300 }),
      type: 'html-template',
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      type: 'template',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      type: 'template',
    },
  ];

  public deleteNode(node: Node) {
    const result = removeNodes([node.id], { nodes: this.nodes, edges: this.edges });
    this.nodes = result.nodes;
    this.edges = result.edges;
  }

  public deleteEdge(edge: Edge) {
    this.edges = removeEdges([edge.id], this.edges);
  }
}
