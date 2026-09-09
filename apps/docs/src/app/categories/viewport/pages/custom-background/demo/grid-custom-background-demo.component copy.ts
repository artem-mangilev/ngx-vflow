import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="nodes"
    [edges]="edges"
    [background]="{ type: 'grid' }"
    [snapGrid]="[20, 20]"
    data-vui-theme="light"
    ><ng-template edge let-ctx
      ><svg:g customTemplateEdge selectable>
        <svg:path
          class="vui-edge"
          [attr.d]="ctx.path()"
          [attr.marker-start]="ctx.markerStart()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.data-vui-selected]="ctx.selected() || ctx.preselected()" /></svg:g></ng-template
    ><ng-template edgeLabelHtml let-ctx
      ><span class="vui-edge-label">{{ ctx.label.data }}</span></ng-template
    ></vflow
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
export class GridCustomBackgroundDemoComponent {
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
