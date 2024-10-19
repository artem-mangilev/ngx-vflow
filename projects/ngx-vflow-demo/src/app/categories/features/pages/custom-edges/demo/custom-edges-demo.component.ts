import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template edge let-ctx>
      <svg:path
        [attr.d]="ctx.path()"
        [attr.stroke-width]="ctx.edge.data.strokeWidth"
        [attr.stroke]="ctx.edge.data.color"
        [attr.marker-end]="ctx.markerEnd()"
        fill="none"
      />
    </ng-template>
  </vflow>`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class CustomEdgesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: '1'
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'default',
      text: '2'
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'default',
      text: '3'
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      type: 'template',
      data: {
        strokeWidth: 4,
        color: '#ffeeaa'
      },
      markers: {
        end: {
          type: 'arrow-closed',
          width: 30,
          height: 30,
          color: '#ffeeaa'
        }
      }
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      type: 'template',
      data: {
        strokeWidth: 2,
        color: '#ec586e'
      }
    },
  ]
}

