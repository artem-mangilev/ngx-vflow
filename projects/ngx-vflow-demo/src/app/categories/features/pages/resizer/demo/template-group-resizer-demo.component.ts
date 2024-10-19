import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes">
    <ng-template groupNode let-ctx>
      <svg:rect
        [resizable]="ctx.selected()"
        selectable
        [style.stroke-width]="ctx.selected() ? 3 : 1"
        [attr.width]="ctx.width()"
        [attr.height]="ctx.height()"
        rx="5"
        ry="5"
        stroke="red"
        fill="red"
        fill-opacity="0.05"
      >
      </svg:rect>
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
export class TemplateGroupResizerDemoComponent {
  public nodes: Node[] = [
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
      parentId: '5'
    },
  ]
}
