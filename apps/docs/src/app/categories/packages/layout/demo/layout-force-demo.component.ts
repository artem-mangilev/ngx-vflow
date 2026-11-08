import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VxLayout } from '@vflow/layout';
import { forceLayout } from '@vflow/layout/d3-force';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  template: `
    <label class="toolbar">
      <span>Link distance {{ distance() }}</span>
      <input
        type="range"
        min="40"
        max="240"
        step="10"
        [value]="distance()"
        (input)="distance.set(+$any($event.target).value)" />
    </label>
    <vflow [vxLayout]="layout()" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }">
      <!--
        A ball whose whole surface is the handle, so the edges meet it at its center. It neither starts nor accepts
        connections, so a press on it drags the node.
      -->
      <div
        *vNode="let ctx"
        class="ball"
        vHandle
        handleType="any"
        position="center"
        [canStart]="false"
        [canAccept]="false"
        [class.hub]="ctx.node.id === 'n0'">
        {{ ctx.data().text }}
      </div>
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
      gap: 8px;
      align-items: center;
      font-size: 13px;
    }
    .ball {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid var(--vui-accent);
      background: var(--vui-surface);
      color: var(--vui-foreground);
      font-size: 12px;
      cursor: grab;
    }
    .ball.hub {
      width: 60px;
      height: 60px;
      background: var(--vui-accent);
      color: white;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VxLayout],
})
export class LayoutForceDemoComponent {
  protected readonly distance = signal(120);
  // A continuous layout: every tick of the simulation moves the nodes; a dragged ball pins and reheats it.
  protected readonly layout = computed(() =>
    forceLayout({ linkDistance: this.distance(), chargeStrength: -500, center: { x: 400, y: 250 } }),
  );
  protected readonly nodes = createNodes(
    Array.from({ length: 12 }, (_, i) => ({
      id: `n${i}`,
      point: { x: 300 + (i % 4) * 60, y: 200 + Math.floor(i / 4) * 60 },
      data: { text: `${i}` },
    })),
  );
  protected readonly edges = createEdges(
    [
      ...Array.from({ length: 11 }, (_, i) => ({ id: `e${i}`, source: 'n0', target: `n${i + 1}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, source: `n${i + 1}`, target: `n${i + 6}` })),
    ].map((edge) => ({ ...edge, curve: 'straight' as const })),
  );
}
