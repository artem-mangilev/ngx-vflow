import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import { Connection, Edge, VflowComponent, Vflow, Node, isDefaultGroupNode, isTemplateNode } from 'ngx-vflow';

@Component({
  templateUrl: './drag-and-drop-nodes-demo.component.html',
  styleUrls: ['./drag-and-drop-nodes-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, DndModule],
})
export class DragAndDropNodesDemoComponent {
  public vflow = viewChild.required(VflowComponent);

  public nodes: Node[] = [
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
    const spaces = this.vflow().documentPointToFlowPoint(
      {
        x: event.x,
        y: event.y,
      },
      { spaces: true },
    );
    const [point] = spaces;

    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        point: signal(point),
        type: 'html-template',
        parentId: signal(point.spaceNodeId),
        data: signal({
          canDetach: spaces.length > 1,
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
    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      nodeToUpdate.point.set(this.vflow().toNodeSpace(nodeId, null));
      nodeToUpdate.parentId?.set(null);
      nodeToUpdate.data?.set({ canDetach: false });
    }
  }

  onPositionChange() {
    // Update all template nodes' canAttach state
    this.nodes.filter(isTemplateNode).forEach((node) => {
      const intersectingNodes = this.vflow().getIntesectingNodes(node.id).filter(isDefaultGroupNode);

      const canAttach = intersectingNodes.length > 0 && !node.parentId?.();
      node.data?.update((state) => ({ ...state, canAttach }));
    });
  }

  attachNode(nodeId: string) {
    const [intersectionNode] = this.vflow().getIntesectingNodes(nodeId).filter(isDefaultGroupNode);

    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      nodeToUpdate.point.set(this.vflow().toNodeSpace(nodeId, intersectionNode.id));
      nodeToUpdate.parentId?.set(intersectionNode.id);
      nodeToUpdate.data?.set({ canDetach: true });
    }
  }
}
