import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges"
    [handlePositions]="{ source: 'bottom', target: 'top' }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class HandlePositionsTtbDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 150, y: 10 },
      type: 'default',
      text: '1'
    },
    {
      id: '2',
      point: { x: 10, y: 200 },
      type: 'default',
      text: '2'
    },
    {
      id: '3',
      point: { x: 290, y: 200 },
      type: 'default',
      text: '3'
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      markers: {
        end: { type: 'arrow-closed' }
      }
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      markers: {
        end: { type: 'arrow-closed' }
      }
    },
  ]
}

