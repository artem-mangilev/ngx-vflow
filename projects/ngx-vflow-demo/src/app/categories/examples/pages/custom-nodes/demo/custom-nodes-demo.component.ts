import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes">
    <ng-template nodeHtml let-ctx>
      <div class="custom-node" [class.custom-node_selected]="ctx.selected()">
        {{ ctx.node.data.text }}
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
          border: 2px solid gray;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class CustomNodesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'html-template',
      data: {
        customType: 'gradient',
        text: 'I am a nice custom node with gradient'
      }
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      type: 'default',
      text: 'Default'
    },
  ]
}
