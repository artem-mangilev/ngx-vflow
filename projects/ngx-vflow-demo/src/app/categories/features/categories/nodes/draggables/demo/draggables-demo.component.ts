import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" />`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class DraggablesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 200 }),
      type: 'default',
      text: signal('1'),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 100 }),
      type: 'default',
      text: signal('2'),
      draggable: signal(false),
    },
    {
      id: '3',
      point: signal({ x: 200, y: 300 }),
      type: 'default',
      text: signal('3'),
      draggable: signal(false),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
    },
  ];
}
