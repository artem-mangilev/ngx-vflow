{{ NgDocActions.demoPane("LazyLoadingDemoComponent") }}

Each node of the demo stands in for a widget that is heavy to load: a chart, a data grid, a map. The nodes are far
apart, so one is in view at a time, and the bar lists the components as the flow imports them.

> **Note**
> Open the network tab in DevTools to see components being loaded dynamically.

The library supports splitting a large flow into multiple chunks, where each chunk is loaded according to the `lazyLoadTrigger` input (`'immediate'` by default).

To load nodes when the viewport changes, set `lazyLoadTrigger` to `'viewport'`. The trigger applies to lazy presentations only: a component given as a `() => import(...)` factory, or a template that defers its content with `@defer (when ctx.shouldLoad())`. A component given as a class is already loaded and renders immediately. When `virtualization` is enabled, nodes are loaded immediately instead so the library can measure initial node and handle geometry.

## Lazy loading component nodes

To adapt your existing component nodes, replace component classes in the `component` field with dynamic import factories: A component registered under a key with `withNodeComponents()` is lazy in the same way when its registration is a factory.

```ts
// Eagerly loaded
{
  id: 'revenue',
  point: { x: 0, y: 0 },
  component: RevenueChartNodeComponent,
}

// Lazy loaded
{
  id: 'revenue',
  point: { x: 0, y: 0 },
  component: () => import('./components/revenue-chart-node.component').then((m) => m.RevenueChartNodeComponent)
}
```

## Lazy loading template nodes

For template nodes, the library provides a trigger for the `@defer` syntax through the context.

```
<!-- Eagerly loaded -->
<vflow lazyLoadTrigger="viewport" [nodes]="nodes" [edges]="edges">
  <your-node *vNode="let ctx" />
</vflow>

<!-- Lazy loaded -->
<vflow lazyLoadTrigger="viewport" [nodes]="nodes" [edges]="edges">
  <ng-template let-ctx vNode>
    @defer (when ctx.shouldLoad()) {
      <your-node />
    }
  </ng-template>
</vflow>
```
