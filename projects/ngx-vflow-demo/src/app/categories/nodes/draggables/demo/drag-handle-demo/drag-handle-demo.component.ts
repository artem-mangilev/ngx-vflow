import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  templateUrl: './drag-handle-demo.component.html',
  styleUrls: ['./drag-handle-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DragHandleDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 150 }),
      type: 'html-template',
    },
    {
      id: '2',
      point: signal({ x: 290, y: 50 }),
      type: 'html-template',
    },
    {
      id: '3',
      point: signal({ x: 290, y: 300 }),
      type: 'html-template',
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      type: 'default',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      type: 'default',
    },
  ];
}
