# {{ NgDocPage.title }}

You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> I't important to note that template must be made with SVG. 

Custom handles are not positioned automatically, but the library provides useful template context property to position your handle.

Refer to this interface for `let-ctx` when crafting your handle template:

```ts
interface HandleTemplateImplicitContext {
  /**
   * Point from library where you should put your handle.
   * Pass it in proper SVG element properties
   */
  point: Signal<{ x: number, y: number }>
}
```

{{ NgDocActions.demo("CustomHandlesDemoComponent", { expanded: true }) }}
