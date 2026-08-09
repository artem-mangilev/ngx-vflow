You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> Custom handle templates render as native HTML. The library positions the template wrapper at the handle anchor.

- Custom handles know if validation of `ConnectionSettings.validator()` has failed or succeeded, so you can use `state()` signal in `let-ctx` to add some behavior based on validation result.
- The parent node is available through `node`.

Add the `handle` directive to the `ng-template` to type its `let-ctx` context. The context has this shape:

```ts
interface HandleTemplateImplicitContext {
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
