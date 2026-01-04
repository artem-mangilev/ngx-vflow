import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  templateUrl: './selecting-demo.component.html',
  styleUrls: ['./selecting-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class SelectingDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 150 },
      type: 'html-template',
    },
    {
      id: '2',
      point: { x: 290, y: 50 },
      type: 'default',
      text: 'Selectable',
    },
    {
      id: '3',
      point: { x: 290, y: 300 },
      type: 'default',
      text: 'Selectable',
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
      type: 'template',
    },
  ];
}
