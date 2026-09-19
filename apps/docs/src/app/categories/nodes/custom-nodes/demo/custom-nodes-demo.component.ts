import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowPort } from '@vflow/ui';
import { Node, Edge, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>

    <ng-template let-ctx node>
      <div class="custom-node" selectable [class.custom-node_selected]="ctx.selected()">
        {{ ctx.data().text }}

        <span vflowPort handleType="source" position="right"></span>
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
  imports: [DocsPresentations, Vflow, VflowPort],
})
export class CustomNodesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      data: {
        customType: 'gradient',
        text: 'I am a nice custom node with gradient',
      },
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      data: { text: 'Default' },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
  ];
}
