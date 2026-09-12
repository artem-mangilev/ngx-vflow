import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx nodeHtml><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx groupNode><docs-group [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edgeLabelHtml><docs-edge-label [ctx]="ctx" /></ng-template>

    <ng-template let-ctx edge>
      <svg:g customTemplateEdge selectable>
        <svg:path
          fill="none"
          [attr.d]="ctx.path()"
          [attr.stroke-width]="ctx.edge.data?.().strokeWidth"
          [attr.stroke]="ctx.selected() ? '#0f4c75' : ctx.edge.data?.().color"
          [attr.marker-end]="ctx.markerEnd()" />
      </svg:g>
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class CustomEdgesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'html-template',
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'html-template',
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'html-template',
      data: { text: '3' },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      data: signal({
        strokeWidth: 3,
        color: '#ffeeaa',
      }),
      markers: signal({
        end: {
          type: 'arrow-closed',
          width: 30,
          height: 30,
        },
      }),
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      data: signal({
        strokeWidth: 2,
        color: '#ec586e',
      }),
    },
  ];
}
