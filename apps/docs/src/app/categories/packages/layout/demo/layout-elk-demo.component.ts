import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { elkLayout } from '@vflow/layout/elk';
import { Vflow, VflowComponent } from 'ngx-vflow';
import { demoEdges, demoNodes } from './graph';

@Component({
  template: `
    <div class="toolbar">
      @for (algorithm of algorithms; track algorithm) {
        <button
          class="button"
          type="button"
          [class.active]="selected() === algorithm"
          (click)="selected.set(algorithm)">
          {{ algorithm }}
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
      <docs-node *vNode="let ctx" [ctx]="ctx" [connectable]="false" />
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
export class LayoutElkDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;
  protected readonly algorithms = ['layered', 'mrtree', 'stress'] as const;
  protected readonly selected = signal<'layered' | 'mrtree' | 'stress'>('layered');
  protected readonly layout = computed(() =>
    elkLayout({ algorithm: this.selected(), direction: 'right', nodeSpacing: 40, layerSpacing: 70 }),
  );
  protected readonly nodes = demoNodes();
  protected readonly edges = demoEdges();
}
