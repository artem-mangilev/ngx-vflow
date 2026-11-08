import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { radialTreeLayout, treeLayout } from '@vflow/layout/d3-hierarchy';
import { Vflow, VflowComponent } from 'ngx-vflow';
import { treeEdges, treeNodes } from './graph';

type Shape = 'down' | 'right' | 'radial';

@Component({
  template: `
    <div class="toolbar">
      @for (shape of shapes; track shape) {
        <button class="button" type="button" [class.active]="selected() === shape" (click)="selected.set(shape)">
          {{ shape }}
        </button>
      }
    </div>
    <vflow
      vxLayoutAnimate
      [vxLayout]="layout()"
      [nodes]="nodes"
      [edges]="edges"
      [background]="{ type: 'dots' }"
      (vxLayoutEnd)="flow().fitView({ padding: 0.1, duration: painted ? 300 : 0 })"
      (initialized)="painted = true">
      <docs-node *vNode="let ctx" floating [ctx]="ctx" [connectable]="false" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .toolbar {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 1;
      display: flex;
      gap: 4px;
    }
    .button.active {
      outline: 2px solid var(--vui-accent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VxLayout, VxLayoutAnimate],
})
export class LayoutTreeDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;
  protected readonly shapes: Shape[] = ['down', 'right', 'radial'];
  protected readonly selected = signal<Shape>('down');
  protected readonly layout = computed(() => {
    const shape = this.selected();
    return shape === 'radial'
      ? radialTreeLayout({ levelSpacing: 150 })
      : treeLayout({ direction: shape, nodeSpacing: 30, levelSpacing: 60 });
  });
  protected readonly nodes = treeNodes();
  protected readonly edges = treeEdges();
}
