import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createNodes, createEdges, Vflow } from 'ngx-vflow';

@Component({
  selector: 'core-scene',
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [ariaLabelConfig]="{ flowLabel: 'Core-only graph' }"
    [view]="[440, 220]"
    [nodes]="nodes"
    [edges]="edges">
    <mini-map />
    <ng-template nodeHtml let-ctx>
      <div
        selectable
        [resizable]="true"
        [style.width.px]="ctx.node.width?.()"
        [style.height.px]="ctx.node.height?.()"
        style="border:1px solid currentColor">
        {{ ctx.data().name }} <handle type="source" position="right" /><handle type="target" position="left" />
      </div>
    </ng-template>
    <ng-template edge let-ctx
      ><svg:g customTemplateEdge selectable><svg:path [attr.d]="ctx.path()" fill="none" stroke="currentColor" /></svg:g
    ></ng-template>
  </vflow>`,
})
export class CoreScene {
  readonly nodes = createNodes([
    {
      id: 'a',
      type: 'html-template',
      width: 100,
      height: 50,
      ariaLabel: 'Own source',
      point: { x: 20, y: 60 },
      data: { name: 'Own source' },
    },
    {
      id: 'b',
      type: 'html-template',
      width: 100,
      height: 50,
      ariaLabel: 'Own target',
      point: { x: 240, y: 60 },
      data: { name: 'Own target' },
    },
  ]);
  readonly edges = createEdges([{ id: 'ab', type: 'template', source: 'a', target: 'b' }]);
}
