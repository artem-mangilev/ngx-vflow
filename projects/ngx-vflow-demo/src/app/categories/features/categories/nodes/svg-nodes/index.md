# {{ NgDocPage.title }}

SVG nodes allow you to create custom node shapes using SVG elements. To create an SVG node:

1. Define a node with `type: 'svg-template'`
2. Use the `nodeSvg` template in your Vflow component
3. Access node properties via the template context (`ctx`)

The template context has the following type:

```typescript
interface SvgNodeContext {
  node: any;
  selected: Signal<boolean>;
  width: Signal<number>;
  height: Signal<number>;
}
```

{{ NgDocActions.demoPane("SvgNodesDemoComponent") }}
