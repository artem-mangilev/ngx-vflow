import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Connection, Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (connect)="createEdge($event)" /> `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DefaultConnectionDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: 'default',
      text: signal(`2`),
    },
  ];

  public edges: Edge[] = [];

  public createEdge({ source, target }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}`,
        source,
        target,
      },
    ];
  }
}
