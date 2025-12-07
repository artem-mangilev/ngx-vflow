# {{ NgDocPage.title }}

You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> I't important to note that template must be made with SVG.

- Custom handles are not positioned automatically, but the library provides a useful template context property to position your handle.
- Custom handles know if validation of `ConnectionSettings.validator()` has failed or succeeded, so you can use `state()` signal in `let-ctx` to add some behavior based on validation result.

Refer to this interface for `let-ctx` when crafting your handle template:

```ts
interface HandleTemplateImplicitContext {
  /**
   * Point from library where you should put your handle.
   * Pass it in proper SVG element properties
   */
  point: Signal<{ x: number; y: number }>;

  /**
   * Helper signal to get validation state for current handle. 'idle' by default.
   * You can use it do apply some styles based on state
   */
  state: Signal<'valid' | 'invalid' | 'idle'>;

  /**
   * The parent node of this handle
   */
  node: Node;
}
```

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
