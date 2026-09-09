import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ConnectionSettings, Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" data-vui-theme="light" [nodes]="nodes" [edges]="edges" [connection]="connectionSettings"
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
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class CurvesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 30, y: 100 },
      type: VflowCardNode,
      data: { text: '1' },
      ariaLabel: '1',
    },
    {
      id: '2',
      point: { x: 220, y: 0 },
      type: VflowCardNode,
      data: { text: '2' },
      ariaLabel: '2',
    },
    {
      id: '3',
      point: { x: 220, y: 200 },
      type: VflowCardNode,
      data: { text: '3' },
      ariaLabel: '3',
    },
    {
      id: '4',
      point: { x: 30, y: 300 },
      type: VflowCardNode,
      data: { text: '4' },
      ariaLabel: '4',
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: signal('bezier'),
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: signal('straight'),
    },
    {
      id: '1 -> 4',
      source: '1',
      target: '4',
      curve: signal('smooth-step'),
    },
  ];

  public connectionSettings: ConnectionSettings = {
    curve: 'smooth-step',
  };
}
