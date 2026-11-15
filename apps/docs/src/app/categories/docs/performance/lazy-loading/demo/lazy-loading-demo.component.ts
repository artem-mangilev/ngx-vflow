import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vflow, VflowComponent, createEdges, createNodes } from 'ngx-vflow';

/** A node whose component has not arrived has no content to measure, so every node states its size. */
const SIZE = { width: 224, height: 152 };

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <button docsButton="primary" type="button" (click)="goToNextNode()">Go to next node</button>
      <p aria-live="polite">Components loaded: {{ loaded().join(', ') || 'none yet' }}</p>
    </div>

    <!--
      A fit of the whole graph would bring every node into view and load all three components at once, so the first
      view is the first node alone.
    -->
    <vflow
      #flow
      lazyLoadTrigger="viewport"
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.fitView({ nodes: [nodes[0].id], maxZoom: 1 })">
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class LazyLoadingDemoComponent {
  protected readonly loaded = signal<string[]>([]);

  // A factory in `component` instead of a class: the flow calls it when the node first enters the viewport.
  protected readonly nodes = createNodes([
    {
      id: 'revenue',
      point: { x: 0, y: 0 },
      component: () =>
        import('./components/revenue-chart-node.component').then((m) =>
          this.report('Revenue chart', m.RevenueChartNodeComponent),
        ),
      ...SIZE,
    },
    {
      id: 'orders',
      point: { x: 1000, y: 0 },
      component: () =>
        import('./components/orders-table-node.component').then((m) =>
          this.report('Orders table', m.OrdersTableNodeComponent),
        ),
      ...SIZE,
    },
    {
      id: 'stores',
      point: { x: 2000, y: 0 },
      component: () =>
        import('./components/stores-map-node.component').then((m) =>
          this.report('Stores map', m.StoresMapNodeComponent),
        ),
      ...SIZE,
    },
  ]);

  protected readonly edges = createEdges([
    { id: 'revenue-orders', source: 'revenue', target: 'orders' },
    { id: 'orders-stores', source: 'orders', target: 'stores' },
  ]);

  private readonly flow = viewChild.required(VflowComponent);
  private current = 0;

  protected goToNextNode(): void {
    this.current = (this.current + 1) % this.nodes.length;
    this.flow().fitView({ nodes: [this.nodes[this.current].id], maxZoom: 1, duration: 800 });
  }

  /** Notes a component that has just been imported, so the bar can list what the flow has asked for so far. */
  private report<T>(name: string, component: T): T {
    this.loaded.update((names) => [...names, name]);

    return component;
  }
}
