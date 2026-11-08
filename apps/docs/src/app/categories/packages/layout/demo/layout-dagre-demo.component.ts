import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { dagreLayout } from '@vflow/layout/dagre';
import { Vflow, VflowComponent } from 'ngx-vflow';
import { demoEdges, demoNodes } from './graph';

@Component({
  template: `
    <div class="toolbar">
      @for (direction of directions; track direction) {
        <button class="button" type="button" [class.active]="rankdir() === direction" (click)="rankdir.set(direction)">
          {{ direction }}
        </button>
      }
    </div>
    <vflow
      view="auto"
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
export class LayoutDagreDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  // The first layout ends before the flow paints: fit it at once, and animate the fits that follow.
  protected painted = false;
  protected readonly directions = ['TB', 'LR', 'BT', 'RL'] as const;
  protected readonly rankdir = signal<'TB' | 'LR' | 'BT' | 'RL'>('LR');
  // A new algorithm per direction: the host lays the graph out again when it changes.
  protected readonly layout = computed(() => dagreLayout({ rankdir: this.rankdir(), nodesep: 40, ranksep: 70 }));
  protected readonly nodes = demoNodes();
  protected readonly edges = demoEdges();
}
