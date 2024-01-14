import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Node, VflowModule, uuid } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class VflowDemoComponent {
  public nodes: Node[] = [
    {
      id: uuid(),
      position: { x: 10, y: 10 },
      type: 'default'
    },
    {
      id: uuid(),
      position: { x: 100, y: 100 },
      type: 'default'
    },
  ]

}
