# Tests use the real flow

The library ships no mocks and no testing entry point. An application test renders the real `Vflow`: it works in jsdom and happy-dom, the environments of `ng test` without `--browsers`, and in a browser. `ngx-vflow/testing` with `VflowMocks` and `provideCustomNodeMocks()` is removed in 3.0 without a deprecation period. A component node is tested in a flow of one node.

The mocks existed because `vflow` 2.x did not run in jsdom. They mirrored selectors, inputs, outputs and methods by hand, drifted from the components, and made an application test check the mock instead of the library: the mock rendered no component nodes and emitted no outputs. `provideCustomNodeMocks()` depended on ten internal classes and broke whenever the dependencies of a node changed.

A DOM without layout measures nothing, and the library does not fake a layout there: `initialized()` stays `false`, `fitView()` resolves to `false`, node sizes and handle positions are zeros. A test of geometry runs in a browser. The flow detects such a DOM (the window has a size, the root element has none) and does not hide entities and layers until their first measurement there, so their content is visible to queries of a test. Core must keep rendering and reacting without `ResizeObserver`, `DOMMatrixReadOnly`, pointer capture and a canvas context; the specs in `libs/ngx-vflow/node-dom` run in both environments and fail on any console error or warning.

This supersedes the part of ADR-0008 that names the `ngx-vflow/testing` mocks.

Considered and rejected: keeping the mocks deprecated for one major, because 3.0 already breaks their API; a `provideVflowTesting()` that derives sizes from `width` and `height` and marks the flow initialized, because it would be a second, smaller fake to keep in step with the engine. Component harnesses on `@angular/cdk/testing` are not rejected: they need a DOM contract for node and edge ids and selection that the library does not have yet.
