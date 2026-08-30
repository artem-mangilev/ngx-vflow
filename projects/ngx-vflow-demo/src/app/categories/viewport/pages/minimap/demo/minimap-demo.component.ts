import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx groupNode>
      <div
        selectable
        class="group-node"
        [class.group-node_selected]="ctx.selected()"
        [style.width.px]="ctx.width()"
        [style.height.px]="ctx.height()">
        <handle type="source" position="right" />
      </div>
    </ng-template>

    <mini-map />
  </vflow>`,
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
export class MinimapDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `1`,
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 90, y: 80 },
      type: 'default',
      // it's possible to pass html in this field
      text: `<strong>2</strong>`,
      parentId: '3',
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
      parentId: '3',
    },
    {
      id: '6',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `6`,
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
