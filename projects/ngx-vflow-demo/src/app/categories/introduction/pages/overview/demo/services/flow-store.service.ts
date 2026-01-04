import { Injectable, signal } from '@angular/core';
import { createEdges, createNodes } from 'ngx-vflow';
import { TriggerNodeComponent } from '../components/trigger-node.component';
import { DataNodeComponent } from '../components/data-node.component';
import { TransformNodeComponent } from '../components/transform-node.component';
import { OutputNodeComponent } from '../components/output-node.component';

@Injectable()
export class FlowStoreService {
  readonly nodes = signal(
    createNodes([
      {
        id: 'trigger',
        point: { x: 50, y: 50 },
        type: TriggerNodeComponent,
        data: {
          triggerType: 'Schedule',
        },
      },
      {
        id: 'data',
        point: { x: 50, y: 250 },
        type: DataNodeComponent,
        data: {
          fields: [
            { name: 'id', type: 'number' },
            { name: 'email', type: 'string' },
            { name: 'status', type: 'boolean' },
          ],
        },
      },
      {
        id: 'transform',
        point: { x: 400, y: 180 },
        type: TransformNodeComponent,
        width: 240,
        height: 220,
        data: {
          transformation: 'Map & Filter',
        },
      },
      {
        id: 'group',
        point: { x: 800, y: 0 },
        type: 'default-group',
        width: 500,
        height: 800,
      },
      {
        id: 'output-size',
        parentId: 'group',
        point: { x: 200, y: 70 },
        type: OutputNodeComponent,
      },
      {
        id: 'output-position',
        parentId: 'group',
        point: { x: 200, y: 400 },
        type: OutputNodeComponent,
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
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'text',
              text: 'Start',
            },
          },
        },
      },
      {
        id: 'data->transform-1',
        source: 'data',
        target: 'transform',
        targetHandle: 'input-1',
        type: 'template',
        curve: 'bezier',
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'text',
              text: 'Stream',
            },
          },
        },
        data: {
          type: 'animated',
        },
      },
      {
        id: 'transform->output-size-width',
        source: 'transform',
        sourceHandle: 'output-1',
        target: 'output-size',
        targetHandle: 'width',
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'delete',
            },
          },
        },
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
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'delete',
            },
          },
        },
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
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'delete',
            },
          },
        },
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
        edgeLabels: {
          center: {
            type: 'html-template',
            data: {
              type: 'delete',
            },
          },
        },
        markers: {
          end: {
            type: 'arrow-closed',
          },
        },
      },
    ]),
  );
}
