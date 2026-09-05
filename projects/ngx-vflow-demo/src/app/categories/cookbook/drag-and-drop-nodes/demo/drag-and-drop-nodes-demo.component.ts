import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import {
  Connection,
  Edge,
  VflowComponent,
  Vflow,
  Node,
  addEdges,
  addNodes,
  isDefaultGroupNode,
  isTemplateNode,
  reparentNodes,
  createNodes,
} from 'ngx-vflow';

@Component({
  templateUrl: './drag-and-drop-nodes-demo.component.html',
  styleUrls: ['./drag-and-drop-nodes-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, DndModule],
})
export class DragAndDropNodesDemoComponent {
  public vflow = viewChild.required(VflowComponent);

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default-group',
      width: 250,
      height: 250,
    },
  ]);

  public edges: Edge[] = [];

  public createNode({ event }: DndDropEvent) {
    const flowPoint = this.vflow().clientToFlowPosition({ x: event.x, y: event.y });
    const parent = this.vflow().getNodesAtPoint(flowPoint).find(isDefaultGroupNode);

    this.nodes = addNodes(
      createNodes([
        {
          id: crypto.randomUUID(),
          point: parent?.nodeSpacePoint ?? flowPoint,
          type: 'html-template',
          parentId: parent?.id ?? null,
          data: {
            canDetach: !!parent,
          },
        },
      ]),
      this.nodes,
    );
  }

  public connect(connection: Connection) {
    this.edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes: this.nodes, edges: this.edges });
  }

  public detachNode(nodeId: string) {
    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      const nodes = reparentNodes([{ id: nodeId, parentId: null }], this.nodes);
      if (nodes === this.nodes) return;

      this.nodes = nodes;
      nodeToUpdate.data?.set({ canDetach: false, canAttach: true });
    }
  }

  onPositionChange() {
    // Update all template nodes' canAttach state
    this.nodes.filter(isTemplateNode).forEach((node) => {
      const intersectingNodes = this.vflow().getIntersectingNodes(node.id).filter(isDefaultGroupNode);

      const canAttach = intersectingNodes.length > 0 && !node.parentId?.();
      node.data?.update((state) => ({ ...state, canAttach }));
    });
  }

  attachNode(nodeId: string) {
    const [intersectionNode] = this.vflow().getIntersectingNodes(nodeId).filter(isDefaultGroupNode);
    if (!intersectionNode) return;

    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (nodeToUpdate.type === 'html-template') {
      const nodes = reparentNodes([{ id: nodeId, parentId: intersectionNode.id }], this.nodes);
      if (nodes === this.nodes) return;

      this.nodes = nodes;
      nodeToUpdate.data?.set({ canDetach: true, canAttach: false });
    }
  }
}
