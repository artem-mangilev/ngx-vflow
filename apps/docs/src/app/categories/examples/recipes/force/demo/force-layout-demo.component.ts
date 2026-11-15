import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { VxLayout } from '@vflow/layout';
import { forceLayout } from '@vflow/layout/d3-force';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

/** A service and the services it calls. */
const SERVICE = 'Checkout';
const DEPENDENCIES = ['Payment', 'Inventory', 'Shipping', 'Email', 'Tax', 'Cart'];

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label class="h-7">
        Link distance
        <input
          type="range"
          docsRange
          min="120"
          max="170"
          step="10"
          [value]="distance()"
          (input)="distance.set($any($event.target).valueAsNumber)" />
      </label>
      <p class="tabular-nums">{{ distance() }}</p>
    </div>

    <!--
      The simulation gathers the graph around its center, the origin, and has no end to fit the view at: the view is
      centered there once, at a zoom that still shows the longest links.
    -->
    <vflow
      #flow
      [vxLayout]="layout()"
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.setCenter({ x: 0, y: 0 }, { zoom: 0.8 })">
      <!--
        One floating handle per card: an edge meets the side that faces its other end, wherever the simulation puts
        the cards. The cards neither start nor accept connections, so a press anywhere on a card drags it.
      -->
      <docs-node *vNode="let ctx" floating [ctx]="ctx" [connectable]="false" />
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, VxLayout],
})
export class ForceLayoutDemoComponent {
  protected readonly distance = signal(140);
  // A new algorithm per distance: the layout host starts a new simulation from where the nodes are and applies
  // every tick of it. The cards keep apart by their size (`collide`), so a link is never shorter than a card.
  protected readonly layout = computed(() => forceLayout({ linkDistance: this.distance(), chargeStrength: -200 }));

  // The simulation starts from where the nodes are: on a ring around the service, about where they settle.
  protected readonly nodes = createNodes([
    { id: SERVICE, point: { x: -50, y: -25 }, data: { text: SERVICE } },
    ...DEPENDENCIES.map((text, index) => {
      const angle = (2 * Math.PI * index) / DEPENDENCIES.length;

      return {
        id: text,
        point: { x: this.distance() * Math.cos(angle) - 50, y: this.distance() * Math.sin(angle) - 25 },
        data: { text },
      };
    }),
  ]);

  protected readonly edges = createEdges(
    DEPENDENCIES.map((target) => ({
      id: `${SERVICE}-${target}`,
      source: SERVICE,
      target,
      curve: 'straight' as const,
    })),
  );
}
