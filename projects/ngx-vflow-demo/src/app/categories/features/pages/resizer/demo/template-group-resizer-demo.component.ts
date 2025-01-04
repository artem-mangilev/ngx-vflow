import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, Vflow } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes">
    <ng-template let-ctx groupNode>
      <svg:rect
        selectable
        rx="5"
        ry="5"
        stroke="red"
        fill="red"
        fill-opacity="0.05"
        [resizable]="ctx.selected()"
        [style.stroke-width]="ctx.selected() ? 3 : 1"
        [attr.width]="ctx.width()"
        [attr.height]="ctx.height()"
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
  imports: [Vflow]
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
