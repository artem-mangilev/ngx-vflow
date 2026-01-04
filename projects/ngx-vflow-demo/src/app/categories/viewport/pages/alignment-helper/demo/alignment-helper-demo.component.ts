import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [alignmentHelper]="true" />`,
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
export class AlignmentHelperDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 10 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 90, y: 80 }),
      type: 'default',
      // it's possible to pass html in this field
      text: signal(`<strong>2</strong>`),
      parentId: signal('3'),
    },
    {
      id: '3',
      point: signal({ x: 150, y: 10 }),
      type: 'default-group',
      width: signal(250),
      height: signal(250),
    },
    {
      id: '4',
      point: signal({ x: 450, y: 70 }),
      type: 'default',
      text: signal(`4`),
    },
  ];

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2',
    },
    {
      source: '2',
      target: '4',
      id: '2 -> 4',
    },
    {
      source: '5',
      target: '4',
      id: '5 -> 4',
    },
  ];
}
