`ngx-vflow` is an Angular library for creating node-based applications. It aims to assist you in building anything from a static diagram to a visual editor. You can utilize the default design or apply your own by customizing everything using familiar technologies.

{{ NgDocActions.demo("AllFeaturesDemoComponent", { container: false }) }}

```typescript group="feature-overview" name="all-features-demo.component.ts" file="./demo/all-features-demo.component.ts"

```

```typescript group="feature-overview" name="only-input-node.component.ts"  file="./demo/components/only-input-node.component.ts"

```

```typescript group="feature-overview" name="position-node.component.ts" file="./demo/components/position-node.component.ts"

```

```typescript group="feature-overview" name="resizable-node.component.ts" file="./demo/components/resizable-node.component.ts"

```

```typescript group="feature-overview" name="size-node.component.ts" file="./demo/components/size-node.component.ts"

```

```typescript group="feature-overview" name="toolbar-node.component.ts" file="./demo/components/toolbar-node.component.ts"

```

```typescript group="feature-overview" name="flow-store.service.ts" file="./demo/services/flow-store.service.ts"

```

## Main features

**Easy to use:** Just describe your flow with a simple API; all of the heavy lifting, such as dragging, zooming, and curve math, is handled by the library for you.

**Customizable:** There is a default design for basic usage, and you can also customize nodes with good old HTML and CSS. Other entities such as edges, connection lines, and handles are also customizable, but it will require a little SVG knowledge.

**Great performance:** Angular signals are the heart and soul of `ngx-vflow`, which are performant by default, so you shouldn't worry about performance even with large flows.

**Zoneless:** [Does not require `zone.js`](https://stackblitz.com/edit/stackblitz-starters-qhu6im?file=src%2Fmain.ts)
