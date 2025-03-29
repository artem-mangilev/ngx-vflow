import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicNode, Edge, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx nodeHtml>
      <div class="custom-node" selectable [class.custom-node_selected]="ctx.selected()">
        {{ ctx.node.data().text }}

        <handle type="source" position="right" />
      </div>
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }

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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class CustomNodesDemoComponent {
  public nodes: DynamicNode[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'html-template',
      data: signal({
        customType: 'gradient',
        text: 'I am a nice custom node with gradient',
      }),
    },
    {
      id: '2',
      point: signal({ x: 250, y: 250 }),
      type: 'default',
      text: signal('Default'),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
  ];
}
