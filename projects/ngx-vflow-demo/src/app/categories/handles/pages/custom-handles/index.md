You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> Custom handle templates render as native HTML. The library positions the template wrapper at the handle anchor.

- Custom handles know if validation of `ConnectionSettings.validator()` has failed or succeeded, so you can use `state()` signal in `let-ctx` to add some behavior based on validation result.
- `canStart()` reports whether a new connection may start from this handle, and `canAccept()` reports whether it may accept a connection or reconnection candidate.
- Both inputs default to `true`.
- The parent node is available through `node`.

The demo below intentionally uses the default connection validation so it isolates the handle policies: disable `canStart` on Output 1 and `canAccept` on Input 1 independently. The dimmed handle is disabled; Output 2 remains a working source for comparison. See the separate Connection validation demo for `ConnectionSettings.validator()`.

Add the `handle` directive to the `ng-template` to type its `let-ctx` context. The context has this shape:

```ts
interface HandleTemplateImplicitContext {
  /**
   * Helper signal to get validation state for current handle. 'idle' by default.
   * You can use it do apply some styles based on state
   */
  state: Signal<'valid' | 'invalid' | 'idle'>;

  /** Whether a new connection can start from this handle. */
  canStart: Signal<boolean>;

  /** Whether this handle can accept a connection or reconnection candidate. */
  canAccept: Signal<boolean>;

  /**
   * The parent node of this handle
   */
  node: Node;
}
```

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
