import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  templateUrl: './multiple-node-toolbars-demo.component.html',
  styleUrls: ['./multiple-node-toolbars-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class MultipleNodeToolbarsDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 150, y: 150 },
      type: 'html-template',
    },
  ]);

  public deleteNode(node: Node) {
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
  }
}
