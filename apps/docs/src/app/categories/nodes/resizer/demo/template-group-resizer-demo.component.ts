import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes">
    <ng-template let-ctx node>
      @if (ctx.data().type === 'group') {
        <div
          selectable
          class="group-node"
          [resizable]="ctx.selected()"
          [class.group-node_selected]="ctx.selected()"></div>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
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
  imports: [DocsPresentations, Vflow],
})
export class TemplateGroupResizerDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '5',
      point: { x: 10, y: 10 },
      data: { type: 'group' },
      width: 170,
      height: 70,
    },
    {
      id: '6',
      point: { x: 10, y: 10 },
      data: { text: `6` },
      parentId: '5',
    },
  ]);
}
