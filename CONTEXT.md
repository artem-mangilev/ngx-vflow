# ngx-vflow

ngx-vflow is a programmable engine for building node-based user interfaces in Angular applications.

## Language

**Node-based UI engine**:
A package that supplies graph rendering, viewport behavior, and node-and-edge interaction primitives from which applications build visual editors.
_Avoid_: Diagramming suite, workflow application

**Core feature**:
A capability provided through the documented API of the main ngx-vflow package without requiring application-specific implementation.
_Avoid_: Built-in recipe, native integration

**Capability policy**:
A resolved rule that gates a library-originated interaction while preserving application-owned state and explicit entity overrides.
_Avoid_: Permission system, authorization

**Interaction eligibility**:
Whether a node, edge, or handle may participate in a specific library-originated interaction such as selection or connection.
_Avoid_: Visibility, disabled state

**Viewport gesture policy**:
The rules that determine which user gestures pan or zoom the viewport and how competing gestures are prioritized. Explicit programmatic viewport changes are outside this policy.
_Avoid_: Keyboard shortcuts, interaction eligibility

**First-party extension**:
An optional capability maintained by the package authors but distributed outside the main package contract.
_Avoid_: Core feature, third-party integration

**Official recipe**:
A documented composition of package primitives that application code must implement and own.
_Avoid_: Core feature, built-in feature

**Feature gap**:
A capability supplied as a core feature by a competing node-based UI engine but absent from ngx-vflow's core package.
_Avoid_: Ecosystem difference, missing example

**Application-owned state**:
The authoritative graph state supplied and retained by the application. ngx-vflow may update the application's writable signals for interactive properties, but it does not maintain a separate authoritative graph store.
_Avoid_: Internal graph store, uncontrolled flow

**Structural graph change**:
Adding, removing, or reparenting a node or edge. ngx-vflow describes the requested change, and the application decides whether and how to apply it.
_Avoid_: Interactive property update, internal mutation

**Change notification**:
A post-mutation report that application-owned graph state or one of its writable signals has already changed. It is observational and must not be replayed as a structural graph operation.
_Avoid_: Change request, reducer action

**Structural graph operation**:
A pre-application description of a structural graph change that the application may apply to its owned graph state with package helpers.
_Avoid_: Change notification, internal mutation

**Parent node**:
A node referenced by another node's parent relationship, establishing nested coordinates. Any node type may be a parent; a visual group type is not required.
_Avoid_: Group node

**Client space**:
The browser viewport coordinate system used by DOM events through `clientX` and `clientY`.
_Avoid_: Document space, screen space

**Flow space**:
The root graph coordinate system before viewport translation and zoom are applied.
_Avoid_: World space, canvas space

**Node space**:
A coordinate system whose origin is a specific parent node's origin in flow space. Any parent node may define a node space.
_Avoid_: Group space

**Runtime grouping**:
An interaction that proposes moving a node into or out of a group while preserving its visual position across coordinate spaces.
_Avoid_: Subflow rendering, static parent assignment

**Waypoint**:
An explicit user-controlled point through which an edge route passes between its source and target.
_Avoid_: Curve point, edge handle
