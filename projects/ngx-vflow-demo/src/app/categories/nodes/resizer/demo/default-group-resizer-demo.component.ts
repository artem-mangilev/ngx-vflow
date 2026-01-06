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
  imports: [Vflow],
})
export class DefaultGroupResizerDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 10 }),
      type: 'default',
      text: signal(`1`),
      parentId: signal('3'),
    },
    {
      id: '2',
      point: signal({ x: 90, y: 80 }),
      type: 'default',
      text: signal(`<strong>2</strong>`),
      parentId: signal('3'),
    },
    {
      id: '3',
      point: signal({ x: 10, y: 10 }),
      type: 'default-group',
      width: signal(250),
      height: signal(250),
      resizable: signal(true),
    },
  ];

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2',
    },
  ];
}
