import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [background]="{ type: 'image', src: 'assets/logo.svg', scale: 0.05 }" />`,
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
export class ImageCustomBackgroundDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: '1',
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'default',
      text: '2',
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'default',
      text: '3',
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
