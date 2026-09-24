import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>

    <ng-template let-ctx edge>
      <svg:g edgeInteraction class="edge">
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

      /* The interaction stroke sits inside the group, so hovering near the line counts as hovering the group. */
      .edge:hover path:not(.interactive-edge) {
        filter: brightness(0.85);
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
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
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
          strokeWidth: 3,
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
