{{ NgDocActions.demoPane("LazyLoadingDemoComponent") }}

> **Note**
> Open the network tab in DevTools to see components being loaded dynamically.

The library supports splitting a large flow into multiple chunks, where each chunk is loaded according to the provided `lazyLoadTrigger` in the `Optimization` object.

To load nodes when the viewport changes, set `lazyLoadTrigger` to the value viewport.

## Lazy loading component nodes

To adapt your existing component nodes, replace component constructor calls in the `type` field with dynamic import factories:

```ts
// Eagerly loaded
{
  id: '1',
  point: { x: 10, y: 150 },
  type: NodeAComponent,
}

// Lazy loaded
{
  id: '1',
  point: { x: 10, y: 150 },
  type: () => import('./components/node-a.component').then((m) => m.NodeAComponent)
}
```

## Lazy loading template nodes

For template nodes, the library provides a custom trigger for the `@defer` syntax through the context.

```
<!-- Eagerly loaded -->
<vflow view="auto" [nodes]="nodes" [edges]="edges" [optimization]="{ lazyLoadTrigger: 'viewport' }">
  <ng-template let-ctx nodeHtml>
    <your-node />
  </ng-template>
</vflow>

<!-- Lazy loaded -->
<vflow view="auto" [nodes]="nodes" [edges]="edges" [optimization]="{ lazyLoadTrigger: 'viewport' }">
  <ng-template let-ctx nodeHtml>
    @defer (when ctx.shouldLoad()) {
      <your-node />
    }
  </ng-template>
</vflow>
```
