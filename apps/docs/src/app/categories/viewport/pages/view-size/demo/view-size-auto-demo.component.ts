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
    ></vflow
  >`,
  styles: [
    `
      :host {
        width: 100vw;
        height: 100vh;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class ViewSizeAutoDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: VflowCardNode,
      data: { text: '1' },
      ariaLabel: '1',
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: VflowCardNode,
      data: { text: '2' },
      ariaLabel: '2',
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: VflowCardNode,
      data: { text: '3' },
      ariaLabel: '3',
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
    },
  ];
}
