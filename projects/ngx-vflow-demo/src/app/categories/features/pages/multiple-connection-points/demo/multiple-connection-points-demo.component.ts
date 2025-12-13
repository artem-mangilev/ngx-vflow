import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow, Connection } from 'ngx-vflow';

@Component({
  templateUrl: './multiple-connection-points-demo.component.html',
  styleUrls: ['./multiple-connection-points-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow, CommonModule],
})
export class MultipleConnectionPointsDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 0, y: 150 }),
      type: 'html-template',
      data: signal({
        type: 'output',
        output1: 'output1',
        output2: 'output2',
      }),
    },
    {
      id: '2',
      point: signal({ x: 250, y: 100 }),
      type: 'html-template',
      data: signal({
        type: 'input',
        input1: 'input1',
        input2: 'input2',
      }),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2 one',
      source: '1',
      target: '2',
      sourceHandle: 'output1',
      targetHandle: 'input1',
    },
    {
      id: '1 -> 2 two',
      source: '1',
      target: '2',
      sourceHandle: 'output2',
      targetHandle: 'input2',
    },
  ];

  public createEdge({ source, target, sourceHandle, targetHandle }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}${sourceHandle ?? ''}${targetHandle ?? ''}`,
        source,
        target,
        sourceHandle,
        targetHandle,
      },
    ];
  }
}
