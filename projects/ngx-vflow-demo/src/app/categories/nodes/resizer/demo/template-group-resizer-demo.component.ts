import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes">
    <ng-template let-ctx groupNode>
      <div
        selectable
        class="group-node"
        [resizable]="ctx.selected()"
        [class.group-node_selected]="ctx.selected()"
        [style.width.px]="ctx.width()"
        [style.height.px]="ctx.height()"></div>
    </ng-template>
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
export class TemplateGroupResizerDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '5',
      point: { x: 10, y: 10 },
      type: 'template-group',
      width: 170,
      height: 70,
    },
    {
      id: '6',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `6`,
      parentId: '5',
    },
  ]);
}
