import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, Vflow } from 'ngx-vflow';

@Component({
  templateUrl: './multiple-node-toolbars-demo.component.html',
  styleUrls: ['./multiple-node-toolbars-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class MultipleNodeToolbarsDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 150, y: 150 },
      type: 'html-template',
    },
  ];

  public deleteNode(node: Node) {
    // Since there's only one node, we can simplify this or keep it for potential future expansion
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
  }
}
