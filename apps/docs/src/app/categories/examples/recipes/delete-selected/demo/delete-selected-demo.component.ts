import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VuiPort } from '@vflow/ui';
import { DeleteRequest, Edge, Node, Vflow, removeElements, createNodes } from 'ngx-vflow';

@Component({
  templateUrl: './delete-selected-demo.component.html',
  styleUrls: ['./delete-selected-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VuiPort],
})
export class DeleteSelectedDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 150 },
    },
    {
      id: '2',
      point: { x: 290, y: 50 },
    },
    {
      id: '3',
      point: { x: 290, y: 300 },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
    },
  ];

  public onDeleteRequest(request: DeleteRequest) {
    const result = removeElements(request, { nodes: this.nodes, edges: this.edges });
    this.nodes = result.nodes;
    this.edges = result.edges;
  }
}
