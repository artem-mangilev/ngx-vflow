# Move ready-made presentations to UI and retain core interaction feedback

After the new UI primitives pass their reference-composition checks, ready-made node, group, edge and label presentations move out of core into @vflow/ui. Core retains geometry, hit targets, accessibility and minimal visible interaction feedback, including focus, selection, connection preview, basic handles and resize controls, themed through its independent token contract. Core-only consumers supply their own presentation templates; this keeps standalone interaction usable while removing the built-in presentation catalogue from the engine.

Headless consumption requires applications to supply node and edge presentation, either with their own UI or with @vflow/ui primitives. This is a rendering contract; core continues to own the agreed interaction feedback and accessibility responsibilities.
