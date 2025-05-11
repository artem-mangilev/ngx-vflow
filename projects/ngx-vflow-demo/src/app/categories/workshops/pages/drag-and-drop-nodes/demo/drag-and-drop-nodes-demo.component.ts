import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { Connection, Edge, VflowComponent, Vflow, DynamicNode, NodePositionChange } from 'ngx-vflow';

@Component({
  templateUrl: './drag-and-drop-nodes-demo.component.html',
  styleUrls: ['./drag-and-drop-nodes-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow, DndModule],
})
export class DragAndDropNodesDemoComponent {
  public vflow = viewChild.required(VflowComponent);

  public nodes: DynamicNode[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 10 }),
      type: 'default-group',
      width: signal(250),
      height: signal(250),
    },
  ];

  public edges: Edge[] = [];

  public createNode({ event }: DndDropEvent) {
    const layers = this.vflow().documentPointToFlowPoint(
      {
        x: event.x,
        y: event.y,
      },
      { layers: true },
    );
    const [point] = layers;

    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        point: signal(point),
        type: 'html-template',
        parentId: signal(point.nodeId),
        data: signal({
          canDetach: layers.length > 1,
        }),
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

  public detachNode(nodeId: string) {
    const layers = this.vflow().getLayersUnderNode(nodeId);
    const flowLayer = layers[layers.length - 1];

    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      nodeToUpdate.parentId?.set(null);
      nodeToUpdate.point.set(flowLayer);
      nodeToUpdate.data?.set({ canDetach: false });
    }
  }

  onPositionChange([change, second]: NodePositionChange[]) {
    const nodeToUpdate = this.nodes.find((node) => node.id === change.id);
    if (!nodeToUpdate) return;

    console.log('onPositionChange', change, second);

    const canAttach = this.vflow().getLayersUnderNode(change.id).length > 1 && !nodeToUpdate.parentId?.();

    if (nodeToUpdate.type === 'html-template') {
      nodeToUpdate.data?.update((state) => ({ ...state, canAttach }));
    }

    // TODO: update canAttach on group move?
  }

  attachNode(nodeId: string) {
    const layers = this.vflow().getLayersUnderNode(nodeId);
    const [topLayer] = layers;

    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      nodeToUpdate.parentId?.set(topLayer.nodeId);
      nodeToUpdate.point.set(topLayer);
      nodeToUpdate.data?.set({ canDetach: true });
    }
  }
}
