import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" />`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class DefaultGroupResizerDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `1`,
      parentId: '3'
    },
    {
      id: '2',
      point: { x: 90, y: 80 },
      type: 'default',
      text: `<strong>2</strong>`,
      parentId: '3'
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      type: 'default-group',
      width: 250,
      height: 250,
      resizable: true
    },
  ]

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2'
    }
  ]
}
