import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicNode, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [snapGrid]="[10, 10]">
    <ng-template let-ctx nodeSvg>
      @if (ctx.node.data().type === 'ellipse') {
        <svg:ellipse
          resizable
          fill="#0f4c75"
          [attr.cx]="ctx.width() / 2"
          [attr.cy]="ctx.height() / 2"
          [attr.rx]="ctx.width() / 2"
          [attr.ry]="ctx.height() / 2" />
      }

      @if (ctx.node.data().type === 'rect') {
        <svg:rect resizable fill="#bbe1fa" [attr.width]="ctx.width()" [attr.height]="ctx.height()" />
      }
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
  standalone: true,
  imports: [Vflow],
})
export class SvgNodesDemoComponent {
  public nodes: DynamicNode[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'svg-template',
      width: signal(100),
      height: signal(100),
      data: signal({
        type: 'ellipse',
      }),
    },
    {
      id: '2',
      point: signal({ x: 250, y: 100 }),
      type: 'svg-template',
      width: signal(100),
      height: signal(100),
      data: signal({
        type: 'rect',
      }),
    },
  ];
}
