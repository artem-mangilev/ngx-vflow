import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Node } from '../../interfaces/node.interface';

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
})
export class NodeComponent {
  @Input()
  public node!: Node

  @Input()
  public nodeTemplate!: TemplateRef<any>
}
