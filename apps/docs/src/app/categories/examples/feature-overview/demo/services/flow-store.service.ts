import { Injectable, signal } from '@angular/core';
import { NodeSizeChange, createEdges, createNodes } from 'ngx-vflow';
import { TriggerNodeComponent } from '../components/trigger-node.component';
import { DataNodeComponent } from '../components/data-node.component';
import { TransformNodeComponent } from '../components/transform-node.component';
import { OutputNodeComponent } from '../components/output-node.component';

@Injectable()
export class FlowStoreService {
  /** Latest size of every node, reported by `(nodesChanges.size)` for content-sized and resized nodes alike. */
  readonly sizes = signal<Record<string, { width: number; height: number }>>({});

  applySizeChanges(changes: NodeSizeChange[]) {
    this.sizes.update((sizes) => ({
      ...sizes,
      ...Object.fromEntries(changes.map((change) => [change.id, change.size])),
    }));
  }

  readonly nodes = signal(
    createNodes([
      {
        id: 'trigger',
        point: { x: 50, y: -80 },
        component: TriggerNodeComponent,
      },
      {
        id: 'data',
        point: { x: 50, y: 250 },
        component: DataNodeComponent,
      },
      {
        id: 'transform',
        point: { x: 400, y: 180 },
        component: TransformNodeComponent,
      },
      {
        id: 'group',
        point: { x: 800, y: 0 },
        data: { type: 'group' },
        width: 500,
        height: 800,
      },
      {
        id: 'output-size',
        parentId: 'group',
        point: { x: 200, y: 70 },
        component: OutputNodeComponent,
      },
      {
        id: 'output-position',
        parentId: 'group',
        point: { x: 200, y: 400 },
        component: OutputNodeComponent,
      },
    ]),
  );

  readonly edges = signal(
    createEdges([
      {
        id: 'trigger->data',
        source: 'trigger',
        target: 'data',
        curve: 'smooth-step',
        data: { text: 'Smooth Step Edge' },
      },
      {
        id: 'data->transform-1',
        source: 'data',
        target: 'transform',
        targetHandle: 'input-1',
        curve: 'bezier',
        data: { type: 'animated', text: 'Animated Edge' },
      },
      {
        id: 'transform->output-size-width',
        source: 'transform',
        sourceHandle: 'output-1',
        target: 'output-size',
        targetHandle: 'width',
        data: { deletable: true },
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
      {
        id: 'transform->output-size-height',
        source: 'transform',
        sourceHandle: 'output-1',
        target: 'output-size',
        targetHandle: 'height',
        data: { deletable: true },
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
      {
        id: 'transform->output-position-x',
        source: 'transform',
        sourceHandle: 'output-1',
        target: 'output-position',
        targetHandle: 'x',
        data: { deletable: true },
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
      {
        id: 'transform->output-position-y',
        source: 'transform',
        sourceHandle: 'output-1',
        target: 'output-position',
        targetHandle: 'y',
        data: { deletable: true },
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
    ]),
  );
}
