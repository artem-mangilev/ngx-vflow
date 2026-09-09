import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" data-vui-theme="light" [nodes]="nodes" [edges]="edges"
    ><ng-template let-ctx edge
      ><svg:g customTemplateEdge selectable>
        <svg:path
          class="vui-edge"
          [attr.d]="ctx.path()"
          [attr.marker-start]="ctx.markerStart()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.data-vui-selected]="ctx.selected() || ctx.preselected()" /></svg:g></ng-template
    ><ng-template let-ctx edgeLabelHtml
      ><span class="vui-edge-label">{{ ctx.label.data }}</span></ng-template
    ><ng-template let-ctx groupNode>
      <div
        class="vui-group"
        selectable
        [attr.data-vui-selected]="ctx.selected() || ctx.preselected()"
        [resizable]="ctx.data()?.resizable ?? false"
        [style.width.px]="ctx.width()"
        [style.height.px]="ctx.height()">
        {{ ctx.data()?.text }}
      </div>
    </ng-template></vflow
  >`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DefaultGroupResizerDemoComponent {
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
      data: { resizable: true },
    },
  ]);

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2',
    },
  ];
}
