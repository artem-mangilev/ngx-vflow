import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template groupNode let-ctx>
      <svg:rect
        selectable
        rx="5"
        ry="5"
        [attr.width]="ctx.width()"
        [attr.height]="ctx.height()"
        [style.stroke]="'red'"
        [style.fill]="'red'"
        [style.fill-opacity]="0.05"
        [style.stroke-width]="ctx.selected() ? 3 : 1"
      >
        <handle type="source" position="right" />
      </svg:rect>
    </ng-template>

    <mini-map [scaleOnHover]="true" />
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
export class MinimapDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `1`,
      parentId: '3'
    },
    {
      id: '2',
      point: { x: 90, y: 80 },
      type: 'default',
      // it's possible to pass html in this field
      text: `<strong>2</strong>`,
      parentId: '3'
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      type: 'default-group',
      width: 250,
      height: 250,
    },
    {
      id: '4',
      point: { x: 280, y: 10 },
      type: 'default',
      text: `4`,
    },
    {
      id: '5',
      point: { x: 10, y: 160 },
      type: 'template-group',
      width: 170,
      height: 70,
      parentId: '3'
    },
    {
      id: '6',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `6`,
      parentId: '5'
    },
  ]

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2'
    },
    {
      source: '2',
      target: '4',
      id: '2 -> 4'
    },
    {
      source: '5',
      target: '4',
      id: '5 -> 4'
    },
  ]
}
