import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import {
  Connection,
  Edge,
  VflowComponent,
  Vflow,
  Node,
  addEdges,
  addNodes,
  reparentNodes,
  createNodes,
} from 'ngx-vflow';

/** Containers are marked in application data; the flow itself has no group node type. */
const isGroup = (node: Node) => node.data?.().type === 'group';

@Component({
  templateUrl: './drag-and-drop-nodes-demo.component.html',
  styleUrls: ['./drag-and-drop-nodes-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, DndModule],
})
export class DragAndDropNodesDemoComponent {
  public vflow = viewChild.required(VflowComponent);

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      data: { type: 'group' },
      width: 250,
      height: 250,
    },
  ]);

  public edges: Edge[] = [];

  public createNode({ event }: DndDropEvent) {
    const flowPoint = this.vflow().clientToFlowPosition({ x: event.x, y: event.y });
    const parent = this.vflow().getNodesAtPoint(flowPoint).find(isGroup);

    this.nodes = addNodes(
      createNodes([
        {
          id: crypto.randomUUID(),
          point: parent?.nodeSpacePoint ?? flowPoint,
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

    if (!isGroup(nodeToUpdate)) {
      const nodes = reparentNodes([{ id: nodeId, parentId: null }], this.nodes);
      if (nodes === this.nodes) return;

      this.nodes = nodes;
      nodeToUpdate.data?.set({ canDetach: false, canAttach: true });
    }
  }

  onPositionChange() {
    // Update all template nodes' canAttach state
    this.nodes
      .filter((node) => !isGroup(node))
      .forEach((node) => {
        const intersectingNodes = this.vflow().getIntersectingNodes(node.id).filter(isGroup);

        const canAttach = intersectingNodes.length > 0 && !node.parentId?.();
        node.data?.update((state) => ({ ...state, canAttach }));
      });
  }

  attachNode(nodeId: string) {
    const [intersectionNode] = this.vflow().getIntersectingNodes(nodeId).filter(isGroup);
    if (!intersectionNode) return;

    const nodeToUpdate = this.nodes.find((node) => node.id === nodeId);
    if (!nodeToUpdate) return;

    if (!isGroup(nodeToUpdate)) {
      const nodes = reparentNodes([{ id: nodeId, parentId: intersectionNode.id }], this.nodes);
      if (nodes === this.nodes) return;

      this.nodes = nodes;
      nodeToUpdate.data?.set({ canDetach: true, canAttach: false });
    }
  }
}
