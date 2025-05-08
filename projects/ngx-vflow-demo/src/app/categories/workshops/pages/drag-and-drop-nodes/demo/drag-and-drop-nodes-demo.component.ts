import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { Connection, Edge, Node, VflowComponent, Vflow } from 'ngx-vflow';

@Component({
  templateUrl: './drag-and-drop-nodes-demo.component.html',
  styleUrls: ['./drag-and-drop-nodes-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow, DndModule],
})
export class DragAndDropNodesDemoComponent {
  public vflow = viewChild.required(VflowComponent);

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default-group',
      width: 250,
      height: 250,
    },
  ];

  public edges: Edge[] = [];

  public createNode({ event }: DndDropEvent) {
    const [point] = this.vflow().documentPointToFlowPoint(
      {
        x: event.x,
        y: event.y,
      },
      { layers: true },
    );

    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        point,
        type: 'html-template',
        parentId: point.nodeId,
      },
    ];
  }

  public connect({ source, target }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}`,
        source,
        target,
      },
    ];
  }
}
