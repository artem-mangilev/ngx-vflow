import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class DefaultNodesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'default',
      text: `1`,
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'default',
      // it's possible to pass html in this field
      text: `<strong>2</strong>`
    },
  ]
}
