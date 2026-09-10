You can pass a `[template]` to `HandleComponent` with custom handle.

> **Info**
> Custom handle templates render as native HTML. CSS positions the wrapper in its containing block; the engine measures its actual DOM box for connection endpoints.

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

## Refreshing handle geometry

When your application changes handle placement without resizing the node or handle,
request fresh measurements **after the DOM has been updated**:

```ts
// `flow` is a VflowComponent reference. The DOM layout changes above this call
// have already been applied (for Angular bindings, call after rendering).
flow.refreshNodeHandles(['customer']);
```

The method accepts a readonly array of node IDs. It schedules measurements on the
next animation frame, coalescing repeated requests with resize and native scroll
updates for each node. It does not synchronously measure, move ports, change graph
state or emit node/edge changes. Unknown IDs are ignored; culled nodes retain their
last geometry and are remeasured when restored. Requests affect only this editor.

Native scroll inside a node is observed automatically. If application code moves
ports outside the scrolling content (for example, docks them to its visible border),
call `refreshNodeHandles` after those CSS writes. Do not dispatch synthetic scroll
events to request geometry updates.

Refreshing geometry does not decide where a hidden port belongs. Keep handles
mounted in a measurable layer outside `overflow` / `display: none` content and let
the application choose whether to dock them to a header or scroll boundary. See the
[Entities composition](/design-system/entities) for an application-owned docking policy for small field sets.

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
