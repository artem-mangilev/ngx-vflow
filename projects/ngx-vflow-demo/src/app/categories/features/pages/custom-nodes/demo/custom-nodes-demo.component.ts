import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { DynamicNode, Edge, isTemplateNode, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges">
    <ng-template nodeHtml let-ctx>
      <div class="custom-node" [class.custom-node_selected]="ctx.selected()">
        {{ ctx.node.data().text }}

        <handle type="source" position="right"/>
      </div>
    </ng-template>
  </vflow>`,
  styles: [
    `
      .custom-node {
        width: 150px;
        height: 100px;
        background: linear-gradient(to right, #00d2ff, #3a7bd5);
        border: 1px solid gray;
        border-radius: 5px;
        display: flex;
        align-items: center;
        padding-left: 5px;
        padding-right: 5px;

        &_selected {
          border: 2px solid red;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class CustomNodesDemoComponent implements OnInit {
  public nodes: DynamicNode[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'html-template',
      data: signal({
        customType: 'gradient',
        text: 'I am a nice custom node with gradient'
      })
    },
    {
      id: '2',
      point: signal({ x: 250, y: 250 }),
      type: 'default',
      text: signal('Default')
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2'
    }
  ]

  ngOnInit(): void {
    setTimeout(() => {
      const node = this.nodes[0]

      if (isTemplateNode<{ customType: string, text: string }>(node) && node.data) {
        node.data.set({ ...node.data(), text: 'hello' })
      }
    }, 2000)
  }
}
