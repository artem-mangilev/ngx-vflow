import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  Vflow,
  Node,
  Edge,
  Connection,
  ConnectionSettings,
  isComponentStaticNode,
  isDefaultStaticNode,
} from 'ngx-vflow';
import { ComplexCustomNodeComponent, ComplexCustomNodeData } from './components/complex-custom-node.component';
import { SimpleCustomNodeComponent } from './components/simple-custom-node.component';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="connection"
    [background]="{ type: 'dots' }"
    (onConnect)="handleConnect($event)">
    <ng-template let-ctx edge>
      <svg:path
        fill="none"
        [attr.d]="ctx.path()"
        [attr.stroke-width]="4"
        [attr.stroke]="ctx.edge.data.color"
        [attr.marker-end]="ctx.markerEnd()" />
    </ng-template>

    <ng-template let-ctx edgeLabelHtml>
      <div class="label" [style.background-color]="ctx.label.data.color" (click)="deleteEdge(ctx.edge)">Delete</div>
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }

      .label {
        width: 60px;
        height: 25px;
        background-color: #122c26;
        border-radius: 5px;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class AllFeaturesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: 'Default',
    },
    {
      id: '2',
      point: { x: 200, y: 10 },
      type: 'default',
      text: `Resized`,
      width: 100,
      height: 100,
    },
    {
      id: '3',
      point: { x: 200, y: 270 },
      type: SimpleCustomNodeComponent,
      draggable: false,
    },
    {
      id: '4',
      point: { x: 600, y: 150 },
      type: ComplexCustomNodeComponent,
      data: {
        id: {
          one: signal(''),
          two: signal(''),
          three: signal(''),
        },
      },
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      markers: { end: { type: 'arrow-closed' } },
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: 'straight',
      markers: { end: { type: 'arrow' } },
    },
    {
      id: '3 -> 4-three',
      source: '3',
      target: '4',
      targetHandle: 'three',
    },
  ];

  public connection: ConnectionSettings = {
    validator(connection) {
      if (connection.source === '3') {
        return false;
      }

      return true;
    },
  };

  handleConnect(connection: Connection) {
    if (connection.target === '4') {
      const data = this.nodes.filter(isComponentStaticNode).find((n) => n.id === '4')?.data as ComplexCustomNodeData;

      const sourceNode = this.nodes.filter(isDefaultStaticNode).find((n) => n.id === connection.source);

      if (sourceNode) {
        if (connection.targetHandle === 'one') {
          data.id.one.set(sourceNode.text ?? '');
        }
        if (connection.targetHandle === 'two') {
          data.id.two.set(sourceNode.text ?? '');
        }
        if (connection.targetHandle === 'three') {
          data.id.three.set(sourceNode.text ?? '');
        }
      }
    }

    const color = randomHex();
    this.edges = [
      ...this.edges,
      {
        id: crypto.randomUUID(),
        type: 'template',
        data: {
          color,
        },
        markers: {
          end: {
            type: 'arrow-closed',
            width: 30,
            height: 30,
            color,
          },
        },
        edgeLabels: {
          center: {
            type: 'html-template',
            data: { color },
          },
        },
        ...connection,
      },
    ];
  }

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => e !== edge);
  }
}

function randomHex() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length);
    hex += hexValues[index];
  }

  return hex;
}
