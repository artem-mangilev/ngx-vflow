import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow, Connection, ConnectionSettings } from 'ngx-vflow';

@Component({
  templateUrl: './custom-handles-demo.component.html',
  styleUrls: ['./custom-handles-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class CustomHandlesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 0, y: 150 },
      type: 'html-template',
      data: {
        type: 'output',
        output1: 'output1',
        output2: 'output2',
      },
    },
    {
      id: '2',
      point: { x: 250, y: 100 },
      type: 'html-template',
      data: {
        type: 'input',
        input1: 'input1',
        input2: 'input2',
      },
    },
  ];

  public edges: Edge[] = [];

  public connectionSettings: ConnectionSettings = {
    validator: (connection) => {
      return connection.target === '2' && connection.targetHandle === 'input1';
    },
  };

  public createEdge({ source, target, sourceHandle, targetHandle }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}${sourceHandle ?? ''}${targetHandle ?? ''}`,
        markers: {
          start: { type: 'arrow-closed' },
          end: { type: 'arrow-closed' },
        },
        source,
        target,
        sourceHandle,
        targetHandle,
      },
    ];
  }
}
