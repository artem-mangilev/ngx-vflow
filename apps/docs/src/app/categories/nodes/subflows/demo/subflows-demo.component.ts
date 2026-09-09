import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" data-vui-theme="light" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx groupNode>
      <div
        selectable
        class="group-node"
        [class.group-node_selected]="ctx.selected() || ctx.preselected()"
        [style.width.px]="ctx.width()"
        [style.height.px]="ctx.height()">
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

      .group-node {
        box-sizing: border-box;
        border: 1px solid red;
        border-radius: 5px;
        background-color: rgba(255, 0, 0, 0.05);
      }

      .group-node_selected {
        border-width: 3px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class SubflowsDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: VflowCardNode,
      data: { text: `1` },
      ariaLabel: `1`,
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 90, y: 80 },
      type: VflowCardNode,
      // it's possible to pass html in this field
      data: { text: `2` },
      ariaLabel: `2`,
      parentId: '3',
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      type: 'template-group',
      width: 250,
      height: 250,
    },
    {
      id: '4',
      point: { x: 280, y: 10 },
      type: VflowCardNode,
      data: { text: `4` },
      ariaLabel: `4`,
    },
    {
      id: '5',
      point: { x: 10, y: 160 },
      type: 'template-group',
      width: 170,
      height: 70,
      parentId: '3',
    },
    {
      id: '6',
      point: { x: 10, y: 10 },
      type: VflowCardNode,
      data: { text: `6` },
      ariaLabel: `6`,
      parentId: '5',
    },
  ]);

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2',
    },
    {
      source: '2',
      target: '4',
      id: '2 -> 4',
    },
    {
      source: '5',
      target: '4',
      id: '5 -> 4',
    },
  ];
}
