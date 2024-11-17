import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './node-toolbar-demo.component.html',
  styleUrls: ['./node-toolbar-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, CommonModule]
})
export class NodeToolbarDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 60, y: 150 },
      type: 'html-template',
      data: {
        type: 'output',
        output1: 'output1',
        output2: 'output2'
      }
    },
    {
      id: '2',
      point: { x: 300, y: 100 },
      type: 'html-template',
      data: {
        type: 'input',
        input1: 'input1',
        input2: 'input2'
      }
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2 one',
      source: '1',
      target: '2',
      sourceHandle: 'output1',
      targetHandle: 'input1',
    },
    {
      id: '1 -> 2 two',
      source: '1',
      target: '2',
      sourceHandle: 'output2',
      targetHandle: 'input2'
    },
  ]

  public deleteNode(node: Node) {
    this.nodes = this.nodes.filter(n => n.id !== node.id)
  }
}
