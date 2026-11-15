import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxLayout } from '@vflow/layout';
import { forceLayout } from '@vflow/layout/d3-force';
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';
import { routeEdges, routeNodes } from './graph';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label class="h-7">
        Link distance
        <input
          type="range"
          docsRange
          min="60"
          max="120"
          step="10"
          [value]="distance()"
          (input)="distance.set($any($event.target).valueAsNumber)" />
      </label>
      <p class="tabular-nums">{{ distance() }}</p>
    </div>

    <!--
      The simulation gathers the graph around its center, the origin, and has no end to fit the view at: the view is
      centered there once, and the longest links still fit it.
    -->
    <vflow
      #flow
      [vxLayout]="layout()"
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.setCenter({ x: 0, y: 0 }, { zoom: 1 })">
      <!--
        A ball whose whole surface is the handle, so the edges meet it at its center. It neither starts nor accepts
        connections, so a press on it drags the node.
      -->
      <div
        *vNode="let ctx"
        vuiNode
        vHandle
        handleType="any"
        position="center"
        class="grid cursor-grab place-items-center rounded-full! text-xs"
        [class]="ctx.data().hub ? 'size-16 font-semibold' : 'size-12'"
        [canStart]="false"
        [canAccept]="false">
        {{ ctx.data().text }}
      </div>
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui, VxLayout],
})
export class LayoutForceDemoComponent {
  protected readonly distance = signal(90);
  // A continuous layout: every tick of the simulation moves the nodes; a dragged ball pins and reheats it. A new
  // algorithm per distance starts a new simulation from where the nodes are.
  protected readonly layout = computed(() => forceLayout({ linkDistance: this.distance(), chargeStrength: -200 }));

  protected readonly nodes = routeNodes(this.distance());
  protected readonly edges = routeEdges();
}
