import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { Connection, Edge, Node, VflowComponent, Vflow } from 'projects/ngx-vflow-lib/src/public-api';

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
      id: crypto.randomUUID(),
      point: { x: 10, y: 150 },
      type: 'html-template',
    },
  ];

  public edges: Edge[] = [];

  public createNode({ event }: DndDropEvent) {
    const point = this.vflow().documentPointToFlowPoint({
      x: event.x,
      y: event.y,
    });

    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        point,
        type: 'html-template',
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
