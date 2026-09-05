# Coordinate spaces and reparenting APIs in node editors

Researched: 2026-08-29

## Scope

This is not a popularity ranking. It compares mature or widely used programmable node/diagram editors that are relevant to ngx-vflow: React Flow/XYFlow, Foblex Flow, AntV X6, JointJS, GoJS, Rete.js, and Cytoscape.js. Only first-party documentation and source code are used.

The comparison separates four concerns that are easy to accidentally mix:

1. converting browser/view coordinates to graph coordinates;
2. converting graph coordinates to a particular parent's local space;
3. finding possible containers under a point or dragged node;
4. changing the parent relationship while preserving the desired visual position.

## Summary matrix

| Tool                | Browser/view ↔ graph                                                            | Child position model                                                                    | Parent candidates                                                                | Attach/detach and parent policy                                                                                        |
| ------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| React Flow / XYFlow | `screenToFlowPosition`, `flowToScreenPosition`                                  | Relative to `parentId`                                                                  | `getIntersectingNodes`, `isNodeIntersecting`; no public "spaces at point" method | Application changes `parentId` and recalculates `position`; application chooses the parent                             |
| Foblex Flow         | `FFlowComponent.getPositionInFlow` for viewport → flow                          | Absolute flow coordinates; `parentId` is separate                                       | Built into the drop-to-group gesture                                             | Library chooses the target; stateless app handles `FDropToGroupEvent`, or managed state applies it                     |
| AntV X6             | `clientToLocal`, `localToClient`, plus page/local/graph variants                | Stored/default position is absolute canvas position; relative get/set is optional       | `getNodesFromPoint`, `getNodesUnderNode`; embedding `findParent`                 | `setParent(null)`, `addChild`/`removeChild`; embedding can choose automatically, app supplies validation/policy        |
| JointJS             | `clientToLocalPoint`, `localToClientPoint`, plus page/paper variants            | Stored/default position is absolute graph position; `parentRelative` is optional        | `findElementViewsAtPoint`; embedding `findParentBy` and z-order policy           | `embed(..., { reparent: true })`, `unembed`; automatic `embeddingMode` or application-driven                           |
| GoJS                | `transformViewToDoc`, `transformDocToView`; input events expose both points     | All `Part.location`/`position` values are document coordinates, including group members | `findPartAt`, `findPartsAt`, `findObjectsAt` in front-to-back order              | `Group.addMembers`, `CommandHandler.addTopLevelParts`, model `setGroupKeyForNodeData`; application chooses drop target |
| Rete.js             | No high-level public pair; docs show manual use of `{ x, y, k }` area transform | `NodeView.position` is absolute area position; scopes plugin moves children by delta    | Scopes plugin hit-tests pointer and picks topmost overlay node                   | Plugin rewrites `node.parent`; classic preset chooses the parent, application can replace the preset                   |
| Cytoscape.js        | Nodes expose `position` and `renderedPosition`; input events expose both        | Global model position plus `relativePosition()` accessor for compound parent            | Event target and bounding boxes; no documented general `nodesAtPoint` API        | `nodes.move({ parent })`; application chooses the parent                                                               |

## React Flow / XYFlow

### Coordinate APIs

`ReactFlowInstance` exposes symmetric live-viewport methods:

- `screenToFlowPosition(clientPosition, options?)` accepts browser client coordinates directly;
- `flowToScreenPosition(flowPosition)` performs the inverse.

It also exposes `getIntersectingNodes(nodeOrRect, partially?)` and `isNodeIntersecting(...)`. These are geometry queries over the rendered flow, not pure coordinate transforms. See the official [`ReactFlowInstance` API](https://reactflow.dev/api-reference/types/react-flow-instance) and the official [intersections example](https://reactflow.dev/examples/nodes/intersections).

### Nested positions and reparenting

A node with `parentId` stores `position` relative to the parent; `{ x: 0, y: 0 }` is the parent's top-left corner. `extent: 'parent'` restricts movement, and `expandParent` can grow the parent. React Flow explicitly says the relationship is not DOM nesting; it changes positioning behavior. See [Sub Flows](https://reactflow.dev/learn/layouting/sub-flows) and the [`Node` type](https://reactflow.dev/api-reference/types/node).

Core React Flow has no `attach`, `detach`, or `reparent` operation that preserves absolute position. The application updates node data and converts between absolute and parent-relative positions. The official [Parent Child Relation](https://reactflow.dev/examples/grouping/parent-child-relation) Pro example describes exactly this: attach by dragging over a group, detach from a toolbar, and application-side conversion from absolute to parent-relative coordinates.

**Responsibility split:** React Flow supplies viewport conversion and intersection primitives. The application chooses a valid parent and performs the topology/position update.

## Foblex Flow

### Coordinate APIs

The Angular `FFlowComponent` exposes `getPositionInFlow(position)`, documented as viewport-to-flow conversion. The public page currently documents no symmetric flow-to-client method. See [`FFlowComponent`](https://flow.foblex.com/docs/f-flow-component).

`fNodePosition` is documented as a position in flow coordinates, while `fNodeParentId` is a separate logical hierarchy field. Groups use the same model through `fGroupPosition` and `fGroupParentId`. The official grouping example keeps child coordinates in the same flow coordinate system even when a parent id is set. See [`FNodeDirective`](https://flow.foblex.com/docs/f-node-directive), [`FGroupDirective`](https://flow.foblex.com/docs/f-group-directive), and the [grouping example](https://flow.foblex.com/examples/grouping).

### Drop-to-group API

Foblex makes the complete interaction first-class:

- `[fDropToGroup]` enables or disables library hit-testing and the gesture;
- `(fDropToGroup)` emits `FDropToGroupEvent` with `nodeIds` and `targetGroupId`;
- the stateless example updates the application's `parentId` fields;
- optional managed state applies the event automatically with `withFlowState({ dropToGroup: true })`.

See the official [Drag to Group guide](https://flow.foblex.com/examples/drag-to-group), [`FDraggableDirective`](https://flow.foblex.com/docs/f-draggable-directive), [managed flow state](https://flow.foblex.com/examples/state), and the [first-party example source](https://raw.githubusercontent.com/Foblex/f-flow/main/libs/f-examples/nodes/drag-to-group/example.ts).

**Responsibility split:** the library chooses the target container and owns drag feedback. In stateless mode the application persists the emitted relationship; managed state can combine selection and mutation.

## AntV X6

### Coordinate APIs

X6 explicitly documents browser `client`, page, canvas `local`, and `graph` spaces. For external pointer input the main pair is `graph.clientToLocal(...)` / `graph.localToClient(...)`; it also exposes page/local and local/graph conversions and supports points and rectangles. See [Coordinate Systems](https://x6.antv.antgroup.com/en/api/graph/coordinate).

A node's default position is absolute relative to the canvas. `node.position({ relative: true })` returns a parent-relative position, and `node.position(x, y, { relative: true })` accepts one, without changing the default model. This is stated most precisely in the first-party [Node API](https://x6.antv.antgroup.com/api/model/node).

### Hit-testing and reparenting

The model exposes:

- `getNodesFromPoint(point)` for all node rectangles containing a point;
- `getNodesInArea(rect)`;
- `getNodesUnderNode(node, { by })` for bbox or key-point containment.

See the [Model API](https://x6.antv.antgroup.com/en/api/mvc/model).

Relationships are explicit through `setParent(parent | null)`, `addChild`, `removeChild`, and related hierarchy queries in the [Cell API](https://x6.antv.antgroup.com/en/api/model/cell). Separately, `Graph` can enable interactive `embedding`: `findParent` chooses bbox/center/corner logic or accepts an application callback, `frontOnly` controls z-order candidates, and `validate` filters allowed parents. See [Interaction: Embedding](https://x6.antv.antgroup.com/en/api/model/interaction).

**Responsibility split:** either the application combines hit-testing with cell hierarchy methods, or the configurable embedding engine chooses a candidate and the application supplies validation.

## JointJS

### Coordinate APIs

`dia.Paper` has a broad symmetric conversion API: `clientToLocalPoint`, `localToClientPoint`, page/local, and paper/local variants, for points and rectangles. Its local space is the diagram space used by element geometry. See [`dia.Paper`](https://docs.jointjs.com/api/dia/Paper/).

Element `position()` is absolute graph position by default. Passing `{ parentRelative: true }` makes get/set relative to the embedding parent. `getRelativePointFromAbsolute` and `getAbsolutePointFromRelative` convert points to/from the element's own rotated coordinate system. See [`dia.Element`](https://docs.jointjs.com/api/dia/Element/).

### Hit-testing and reparenting

`paper.findElementViewsAtPoint(point)` returns all element views whose view bounding boxes contain a local point; area variants are also available. Automatic `embeddingMode` adds drag-in and drag-out behavior. `findParentBy` chooses the tested point/bbox policy, `frontParentOnly` controls whether only the frontmost candidate is considered, and `validateEmbedding` / `validateUnembedding` apply application rules.

Manual hierarchy APIs are `parent.embed(child, { reparent: true })` and `parent.unembed(child)`. While dragging, `elementView.getTargetParentView(evt)` exposes the parent that automatic embedding would currently select. See [Containers & Grouping](https://docs.jointjs.com/learn/features/containers-and-grouping/).

**Responsibility split:** JointJS offers both low-level candidate queries and a high-level embedding state machine. Parent eligibility remains application policy.

## GoJS

### Coordinate APIs and position model

GoJS distinguishes viewport and document coordinates. `Diagram.transformViewToDoc` and `transformDocToView` are symmetric; normalized `InputEvent` instances already expose both `viewPoint` and `documentPoint`. See [Coordinate systems](https://gojs.net/latest/intro/viewport.html), [`Diagram`](https://gojs.net/latest/api/symbols/Diagram.html), and [`InputEvent`](https://gojs.net/latest/api/symbols/InputEvent.html).

All `Part.position` and `Part.location` values are document coordinates, including members of groups. Group members are not children in the Group's visual tree; all Parts live directly in diagram layers. Therefore membership does not introduce a parent-relative node coordinate space. See [`Part.location`](https://gojs.net/latest/api/symbols/Part.html) and [`Group`](https://gojs.net/latest/api/symbols/Group.html).

### Hit-testing and reparenting

`findPartAt` returns the frontmost Part at a document point; `findPartsAt` and `findObjectsAt` return all matches, with the lower-level API described as front-to-back z-order. A group accepts members through `Group.addMembers`; detaching uses `CommandHandler.addTopLevelParts`; model-backed applications call `GraphLinksModel.setGroupKeyForNodeData`. `memberValidation` controls eligibility.

The official [Regrouping Editor](https://gojs.net/latest/samples/regrouping) chooses the destination in application `mouseDrop` handlers: a Group drop calls `addMembers`, while a Diagram-background drop calls `addTopLevelParts`.

**Responsibility split:** GoJS supplies document geometry, z-aware hit-testing, and safe membership operations. The application gesture chooses the parent.

## Rete.js

### Coordinate and nesting APIs

The area plugin exposes its current `{ x, y, k }` transform and node `NodeView.position`, but no documented `screenToGraph` / `graphToScreen` pair. The official FAQ demonstrates manual screen/area arithmetic for viewport center and documents `area.translate(nodeId, position)`. See the [Rete.js FAQ](https://retejs.org/docs/faq/) and [`rete-area-plugin` API](https://retejs.org/docs/api/rete-area-plugin/).

Nested nodes are an advanced `rete-scopes-plugin` feature. Nodes add `parent?: string`; the plugin moves descendants when a parent moves and resizes parents around children. Dynamic changes require changing `node.parent` and notifying the plugin with `scopes.update(...)`. See [Scopes](https://retejs.org/docs/guides/scopes/).

The implementation confirms that positions remain absolute: it changes only `node.parent`, compares the pointer to absolute `NodeView.position` boxes, and translates children by the parent's movement delta. It sorts overlapping candidates by rendered child order and picks the top one. See first-party source for [`reassignParent`](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/scope.ts) and the [classic preset agent](https://github.com/retejs/scopes-plugin/blob/606dd5518c7326673eaec82b113fe502463d0cb5/src/agents/classic/index.ts).

**Responsibility split:** the classic scopes preset owns target selection and reparenting behavior. The application can replace the preset, but the public API does not expose a general geometry-query facade.

## Cytoscape.js

### Coordinate and compound-node APIs

Cytoscape.js exposes node `position()` in model coordinates and `renderedPosition()` on screen. Input events contain both `position` and `renderedPosition`, so common interaction code does not need a separate converter. Compound nodes use `data.parent`; `relativePosition()` provides a parent-relative accessor while regular `position()` remains the global model position. Compound-parent dimensions are inferred from descendants.

Changing hierarchy uses `nodes.move({ parent: id | null })`. The core API provides model and rendered bounding boxes and event targets, but it does not document a general public `nodesAtPoint` method or an automatic drag-to-parent policy. See the first-party [Cytoscape.js API](https://js.cytoscape.org/), especially the Position, Compound nodes, Events, and `eles.move()` sections.

**Responsibility split:** the application decides the new parent from event targets or geometry, then calls the topology operation.

## Cross-tool findings

### 1. Coordinate conversion and containment are separate APIs

No reviewed tool overloads a viewport conversion method to also return every containing coordinate space. Tools either expose a separate hit-test/intersection query (React Flow, X6, JointJS, GoJS), or hide target discovery inside a higher-level grouping gesture (Foblex, Rete, JointJS/X6 embedding).

This supports the ngx-vflow split between:

- `clientToFlowPosition` / `flowToClientPosition`;
- pure `flowToNodeSpacePosition` / `nodeSpaceToFlowPosition` when a parent is already known;
- live `getNodesAtPoint(flowPoint)` when rendered containment must discover the parent.

Restoring a boolean `{ spaces: true }` overload would run against the dominant API shape. Removing the _capability_ would also run against the market: every mature editor supplies either an explicit candidate query or an automatic embedding mechanism.

### 2. There are two viable child-position models

- **Parent-relative:** React Flow and ngx-vflow. Reparenting must convert coordinates to preserve visual position.
- **Absolute graph coordinates plus logical membership:** Foblex Flow, X6, JointJS, GoJS, Rete.js, and Cytoscape.js. Reparenting is simpler, while moving a parent requires the engine to propagate movement or render hierarchy transforms.

Changing ngx-vflow to absolute child positions would be a much larger model change than this ticket and is not justified just to simplify one demo.

### 3. Hit-testing and reparenting remain distinct operations

The common low-level sequence is:

1. convert pointer/view coordinates to graph coordinates;
2. find ordered candidate containers;
3. apply application eligibility rules;
4. reparent through a topology operation;
5. convert position if the model is parent-relative.

High-level embedding engines combine these steps for a specific gesture, but their underlying configuration still distinguishes candidate selection, validation, and relationship mutation.

Therefore `getNodesAtPoint` and `reparentNodes` are complementary, not duplicates: the former answers **where could this node go?**, while the latter safely applies **move these nodes to this already-selected parent**.

### 4. Topmost-first candidates are a useful public contract

JointJS (`frontParentOnly`), X6 (`frontOnly`), GoJS front-to-back hit-testing, and the Rete scopes implementation all make z-order part of parent selection. Returning ngx-vflow candidates topmost-first matches this convention while leaving node-type and business validation to the application.

## Recommendation for ngx-vflow

Keep the current small layered API:

1. Keep pure coordinate transforms explicit and independent of rendered state.
2. Keep `VflowComponent.getNodesAtPoint(flowPoint)` as the live rendered-geometry query. Return shallow node copies with a snapshot `nodeSpacePoint`, so parent-relative consumers receive the useful conversion directly without depending on internal global geometry.
3. Keep `reparentNodes` separate. It should validate and mutate hierarchy, not choose a target from DOM/render state.
4. Do not add a high-level `dropToGroup` state machine in this geometry ticket. Foblex shows that such an API can be valuable, but it is a separate interaction feature with validation, hover feedback, detach semantics, and state ownership decisions.
5. Document the canonical signal-preserving recipe as `clientToFlowPosition` → `getNodesAtPoint` → application filter → `reparentNodes`; the helper preserves both the flow-space position and node identity while converting the stored node-space position. For a newly created node, the selected candidate's `nodeSpacePoint` can be stored directly. This is comparable to React Flow's primitives but avoids forcing every Angular consumer to rebuild containment from internal geometry.

The main design conclusion is that removing `{ spaces: true }` was reasonable only as an API-shape cleanup. Removing convenient container discovery was not. The explicit `getNodesAtPoint` replacement is well supported by the APIs of other mature tools.
