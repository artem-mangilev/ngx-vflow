import { Injectable, signal } from '@angular/core';
import {
  BuiltInCurve,
  Connection,
  NodeSizeChange,
  ReconnectEvent,
  RemoveElementsRequest,
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
import { GroupData, GroupNodeComponent } from '../components/group-node.component';
import { InspectorData, InspectorNodeComponent } from '../components/inspector-node.component';
import { RemovableEdgeComponent } from '../components/removable-edge.component';
import { ResizableNodeComponent } from '../components/resizable-node.component';
import { SettingsNodeComponent } from '../components/settings-node.component';
import { TableData, TableNodeComponent } from '../components/table-node.component';

/** Data of an edge the `vEdge` template of the flow draws; an edge with a component draws itself. */
export interface EdgeData {
  label?: string;
  /** Drawn with moving dashes. */
  animated?: boolean;
}

export type BackgroundPattern = 'dots' | 'grid' | 'none';

/** The step of the grid the nodes snap to: the gap of the background patterns, so a pattern shows the grid. */
export const GRID = 20;

/** An edge with a button that removes it; either of its ends can be dragged to another port. */
const REMOVABLE_EDGE = {
  component: RemovableEdgeComponent,
  markers: { end: 'arrow-closed' as const },
  reconnectable: true,
};

/**
 * The graph of the demo and the settings of its canvas. The flow and the component nodes read and change them, so the
 * store is provided once, by the demo.
 */
@Injectable()
export class FlowStoreService {
  // The settings node changes these; the flow reads them through its inputs.
  readonly snapToGrid = signal(true);
  readonly alignmentGuides = signal(true);
  readonly background = signal<BackgroundPattern>('dots');
  /** Curve of every edge and of the line that follows the pointer while a connection is dragged. */
  readonly curve = signal<BuiltInCurve>('bezier');

  /** Latest size of every node, reported by `(nodesChanges.size)` for content-sized and resized nodes alike. */
  readonly sizes = signal<Record<string, { width: number; height: number }>>({});

  // Every point is a multiple of the grid step, so the scene starts on the grid the nodes snap to.
  readonly nodes = signal(
    createNodes([
      {
        id: 'table',
        point: { x: 0, y: 100 },
        component: TableNodeComponent,
        ariaLabel: 'Table',
        data: {
          fields: [
            { name: 'id', type: 'number' },
            { name: 'name', type: 'string' },
            { name: 'count', type: 'number' },
          ],
        } satisfies TableData,
      },
      { id: 'resizable', point: { x: 320, y: 0 }, component: ResizableNodeComponent, ariaLabel: 'Resizable node' },
      { id: 'settings', point: { x: 580, y: 0 }, component: SettingsNodeComponent, ariaLabel: 'Canvas settings' },
      // A group is a node with a size; its children are positioned inside it and move with it.
      {
        id: 'inspectors',
        point: { x: 240, y: 300 },
        width: 380,
        height: 200,
        component: GroupNodeComponent,
        ariaLabel: 'Group of inspectors',
        data: { title: 'Group' } satisfies GroupData,
      },
      {
        id: 'size',
        parentId: 'inspectors',
        point: { x: 20, y: 60 },
        component: InspectorNodeComponent,
        ariaLabel: 'Size inspector',
        data: { title: 'Size', rows: ['width', 'height'] } satisfies InspectorData,
      },
      {
        id: 'position',
        parentId: 'inspectors',
        point: { x: 200, y: 60 },
        component: InspectorNodeComponent,
        ariaLabel: 'Position inspector',
        data: { title: 'Position', rows: ['x', 'y'] } satisfies InspectorData,
      },
    ]),
  );

  readonly edges = signal(
    createEdges<EdgeData>([
      {
        id: 'id-input',
        source: 'table',
        sourceHandle: 'id',
        target: 'resizable',
        targetHandle: 'input',
        data: { label: 'Animated', animated: true },
      },
      { id: 'name-input', source: 'table', sourceHandle: 'name', target: 'resizable', targetHandle: 'input' },
      { id: 'output-size', source: 'resizable', sourceHandle: 'output', target: 'size', ...REMOVABLE_EDGE },
      { id: 'output-position', source: 'resizable', sourceHandle: 'output', target: 'position', ...REMOVABLE_EDGE },
    ]),
  );

  /** A new edge takes the curve of the others. */
  connect(connection: Connection): void {
    const edge = createEdge<EdgeData>({
      ...connection,
      ...REMOVABLE_EDGE,
      id: crypto.randomUUID(),
      curve: this.curve(),
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

  /** Adds a copy of the node two grid cells down and to the right, and moves the selection to it. */
  duplicate(nodeId: string): void {
    const node = this.nodes().find((node) => node.id === nodeId);

    if (!node) return;

    // The node as plain values and back: the copy gets signals of its own.
    const { x, y } = node.point();
    const copy = createNode({
      ...toStaticNode(node),
      id: crypto.randomUUID(),
      point: { x: x + 2 * GRID, y: y + 2 * GRID },
      selected: true,
    });

    node.selected.set(false);
    this.nodes.update((nodes) => addNodes([copy], nodes));
  }

  /** The curve of an edge is a signal, so the edges are redrawn without a new array. */
  setCurve(curve: BuiltInCurve): void {
    this.curve.set(curve);

    for (const edge of this.edges()) {
      edge.curve.set(curve);
    }
  }

  applySizeChanges(changes: NodeSizeChange[]): void {
    this.sizes.update((sizes) => ({
      ...sizes,
      ...Object.fromEntries(changes.map((change) => [change.id, change.size])),
    }));
  }
}
