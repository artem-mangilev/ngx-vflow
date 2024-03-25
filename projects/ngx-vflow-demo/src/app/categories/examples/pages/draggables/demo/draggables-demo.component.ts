import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class DraggablesDemoComponent {
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
      draggable: false
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'default',
      text: '3',
      draggable: false
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2'
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3'
    },
  ]
}

