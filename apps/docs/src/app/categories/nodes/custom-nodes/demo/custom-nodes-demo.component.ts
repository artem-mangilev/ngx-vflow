import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, Edge, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" data-vui-theme="light" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx nodeHtml>
      <div class="custom-node" selectable [class.custom-node_selected]="ctx.selected()">
        {{ ctx.data().text }}

        <handle type="source" position="right" />
      </div>
    </ng-template>
    <ng-template let-ctx edge
      ><svg:g customTemplateEdge selectable>
        <svg:path
          class="vui-edge"
          [attr.d]="ctx.path()"
          [attr.marker-start]="ctx.markerStart()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.data-vui-selected]="ctx.selected() || ctx.preselected()" /></svg:g></ng-template
    ><ng-template let-ctx edgeLabelHtml
      ><span class="vui-edge-label">{{ ctx.label.data }}</span></ng-template
    ></vflow
  >`,
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
  imports: [Vflow],
})
export class CustomNodesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'html-template',
      data: {
        customType: 'gradient',
        text: 'I am a nice custom node with gradient',
      },
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      type: VflowCardNode,
      data: { text: 'Default' },
      ariaLabel: 'Default',
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
