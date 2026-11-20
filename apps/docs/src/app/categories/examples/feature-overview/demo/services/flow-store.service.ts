import { Injectable, signal } from '@angular/core';
import {
  Connection,
  ReconnectEvent,
  RemoveElementsRequest,
  StaticNode,
  addEdges,
  addNodes,
  createEdge,
  createEdges,
  createNode,
  createNodes,
  reconnectEdges,
  removeElements,
  toStaticNode,
} from 'ngx-vflow';
import { AnnotationData, AnnotationNodeComponent } from '../components/annotation-node.component';
import { GroupData, GroupNodeComponent } from '../components/group-node.component';
import { RemovableEdgeComponent } from '../components/removable-edge.component';
import { StepData, StepNodeComponent } from '../components/step-node.component';

/** Data of an edge: both the `vEdge` template of the flow and the edge component read it. */
export interface EdgeData {
  label?: string;
  /** Drawn with moving dashes. */
  animated?: boolean;
}

/** Every edge has an arrow, and either of its ends can be dragged to another port. */
const EDGE = { markers: { end: 'arrow-closed' as const }, reconnectable: true };

function step(id: string, point: StaticNode['point'], data: StepData, parentId?: string): StaticNode<StepData> {
  return { id, point, parentId, component: StepNodeComponent, ariaLabel: data.title, data };
}

/** A note is a node that stays where it is: it cannot be dragged, and it cannot be selected, so nothing removes it. */
function note(point: StaticNode['point'], data: AnnotationData): StaticNode<AnnotationData> {
  return {
    id: `note-${data.number}`,
    point,
    component: AnnotationNodeComponent,
    draggable: false,
    selectable: false,
    focusable: false,
    ariaLabel: `Note ${data.number}`,
    data,
  };
}

/** The graph of the demo. The flow and the component nodes read and change it, so it is provided once, by the demo. */
@Injectable()
export class FlowStoreService {
  readonly nodes = signal(
    createNodes<StepData | GroupData | AnnotationData>([
      step(
        'order',
        { x: 0, y: 200 },
        {
          title: 'New order',
          meta: 'Webhook',
          kind: 'trigger',
          icon: 'play',
          ports: [{ type: 'source', position: 'right' }],
        },
      ),
      // Selected from the start, so its toolbar is there to see.
      {
        ...step(
          'stock',
          { x: 340, y: 160 },
          {
            title: 'Check stock',
            meta: 'Warehouse API',
            kind: 'action',
            icon: 'search',
            ports: [
              { type: 'target', position: 'left' },
              { type: 'source', position: 'right', id: 'in-stock' },
              { type: 'source', position: 'bottom', id: 'out-of-stock' },
            ],
          },
        ),
        selected: true,
      },
      step(
        'notify',
        { x: 160, y: 420 },
        {
          title: 'Notify customer',
          meta: 'Back-order notice',
          kind: 'notice',
          icon: 'alert',
          ports: [{ type: 'target', position: 'top' }],
          channels: ['Email', 'SMS', 'Push'],
          channel: 'Email',
        },
      ),
      // A group is a node with a size; its children are positioned inside it and move with it.
      {
        id: 'fulfilment',
        point: { x: 700, y: 100 },
        width: 280,
        height: 320,
        component: GroupNodeComponent,
        ariaLabel: 'Fulfilment',
        data: { title: 'Fulfilment' },
      },
      step(
        'pack',
        { x: 40, y: 100 },
        {
          title: 'Pack',
          meta: 'Print the label',
          kind: 'action',
          icon: 'layers',
          ports: [
            { type: 'target', position: 'left' },
            { type: 'source', position: 'bottom' },
          ],
        },
        'fulfilment',
      ),
      step(
        'ship',
        { x: 40, y: 220 },
        {
          title: 'Ship',
          meta: 'Hand over to the courier',
          kind: 'action',
          icon: 'upload',
          ports: [{ type: 'target', position: 'top' }],
        },
        'fulfilment',
      ),

      note(
        { x: 0, y: 50 },
        {
          number: 1,
          text: 'A selected node shows its toolbar: copy the node or delete it.',
          arrow: { side: 'right', width: 156, height: 84, path: 'M4 12 C76 12 132 40 152 80' },
        },
      ),
      note(
        { x: 0, y: 300 },
        {
          number: 2,
          text: 'An edge carries a label and a control. Drag its end to another port.',
          arrow: { side: 'right', width: 64, height: 32, path: 'M4 12 L58 18' },
        },
      ),
      note(
        { x: 750, y: 0 },
        {
          number: 3,
          text: 'A group moves its children and keeps them inside. Select it to resize it.',
          arrow: { side: 'below', width: 24, height: 28, path: 'M12 2 L12 24' },
        },
      ),
      note(
        { x: 272, y: 364 },
        {
          number: 4,
          text: 'An input takes one edge: a second one is refused.',
          arrow: { side: 'left', width: 60, height: 50, path: 'M56 12 C32 14 12 26 6 46' },
        },
      ),
      note({ x: 390, y: 470 }, { number: 5, text: 'Drag a node: guides show where it lines up with the others.' }),
      note(
        { x: 600, y: 470 },
        { number: 6, text: 'Hold Shift and drag to select several nodes. Delete removes the selection.' },
      ),
    ]),
  );

  // One edge of every built-in curve.
  readonly edges = signal(
    createEdges<EdgeData>([
      { id: 'order-stock', source: 'order', target: 'stock', curve: 'bezier', data: { animated: true }, ...EDGE },
      {
        id: 'stock-pack',
        source: 'stock',
        sourceHandle: 'in-stock',
        target: 'pack',
        curve: 'smooth-step',
        data: { label: 'In stock' },
        ...EDGE,
      },
      { id: 'pack-ship', source: 'pack', target: 'ship', curve: 'straight', ...EDGE },
      {
        id: 'stock-notify',
        source: 'stock',
        sourceHandle: 'out-of-stock',
        target: 'notify',
        curve: 'step',
        component: RemovableEdgeComponent,
        data: { label: 'Out of stock' },
        ...EDGE,
      },
    ]),
  );

  /** A new edge is drawn by the component with the button, so it can be removed at once. */
  connect(connection: Connection): void {
    const edge = createEdge<EdgeData>({
      ...connection,
      ...EDGE,
      id: crypto.randomUUID(),
      component: RemovableEdgeComponent,
    });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes(), edges }));
  }

  reconnect(event: ReconnectEvent): void {
    this.edges.update((edges) => reconnectEdges([event], { nodes: this.nodes(), edges }));
  }

  /** Removes the edges and the nodes; a node goes with its children and with the edges attached to it. */
  remove(request: RemoveElementsRequest): void {
    const { nodes, edges } = removeElements(request, { nodes: this.nodes(), edges: this.edges() });

    this.nodes.set(nodes);
    this.edges.set(edges);
  }

  /** Adds a copy of the node a little down and to the right, and moves the selection to it. */
  duplicate(nodeId: string): void {
    const node = this.nodes().find((node) => node.id === nodeId);

    if (!node) return;

    // The node as plain values and back: the copy gets signals of its own.
    const { x, y } = node.point();
    const copy = createNode({
      ...toStaticNode(node),
      id: crypto.randomUUID(),
      point: { x: x + 40, y: y + 40 },
      selected: true,
    });

    node.selected.set(false);
    this.nodes.update((nodes) => addNodes([copy], nodes));
  }
}
