import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './delete-selected-demo.component.html',
  styleUrls: ['./delete-selected-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class DeleteSelectedDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 150 },
      type: 'html-template',
    },
    {
      id: '2',
      point: { x: 290, y: 50 },
      type: 'html-template',
    },
    {
      id: '3',
      point: { x: 290, y: 300 },
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
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
  }

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => e.id !== edge.id);
  }
}
