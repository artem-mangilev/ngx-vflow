import { Injectable, signal } from '@angular/core';
import { Edge, NodeSizeChange, createEdges, createNodes } from 'ngx-vflow';
import { DataNodeComponent } from '../components/data-node.component';
import { OutputData, OutputNodeComponent } from '../components/output-node.component';
import { TransformNodeComponent } from '../components/transform-node.component';
import { TriggerNodeComponent } from '../components/trigger-node.component';

export interface EdgeData {
  label?: string;
  /** Drawn with moving dashes. */
  animated?: boolean;
  /** Carries a button that removes it. */
  deletable?: boolean;
}

/** The graph of the demo. The flow and the component nodes read and change it, so it is provided once, by the demo. */
@Injectable()
export class FlowStoreService {
  /** Latest size of every node, reported by `(nodesChanges.size)` for content-sized and resized nodes alike. */
  readonly sizes = signal<Record<string, { width: number; height: number }>>({});

  readonly nodes = signal(
    createNodes([
      { id: 'trigger', point: { x: 0, y: 0 }, component: TriggerNodeComponent },
      { id: 'data', point: { x: 0, y: 256 }, component: DataNodeComponent },
      { id: 'transform', point: { x: 330, y: 68 }, component: TransformNodeComponent },
      // A group is a node with a size; its children are positioned inside it and move with it.
      {
        id: 'group',
        point: { x: 680, y: 0 },
        width: 260,
        height: 332,
        data: { type: 'group', text: 'A group moves its children' },
      },
      {
        id: 'output-size',
        parentId: 'group',
        point: { x: 40, y: 56 },
        component: OutputNodeComponent,
        data: { title: 'Size', rows: ['width', 'height'] } satisfies OutputData,
      },
      {
        id: 'output-position',
        parentId: 'group',
        point: { x: 40, y: 194 },
        component: OutputNodeComponent,
        data: { title: 'Position', rows: ['x', 'y'] } satisfies OutputData,
      },
    ]),
  );

  readonly edges = signal<Edge<EdgeData>[]>(
    createEdges<EdgeData>([
      {
        id: 'trigger-data',
        source: 'trigger',
        target: 'data',
        curve: 'smooth-step',
        data: { label: 'Smooth step edge' },
      },
      {
        id: 'data-transform',
        source: 'data',
        target: 'transform',
        targetHandle: 'input',
        data: { label: 'Animated edge', animated: true },
      },
      output('output-size'),
      output('output-position'),
    ]),
  );

  applySizeChanges(changes: NodeSizeChange[]) {
    this.sizes.update((sizes) => ({
      ...sizes,
      ...Object.fromEntries(changes.map((change) => [change.id, change.size])),
    }));
  }
}

/** An edge from the resizable node into an output node, which shows values of its source. */
function output(target: string) {
  return {
    id: `transform-${target}`,
    source: 'transform',
    sourceHandle: 'output',
    target,
    markers: { end: { type: 'arrow-closed' as const } },
    data: { deletable: true },
  };
}
