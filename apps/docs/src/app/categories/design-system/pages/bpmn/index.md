BPMN presentations are imported separately from `@vflow/ui/bpmn`.
The scene includes task, start/end, XOR/parallel, a processing pool with two lanes and a
black-box supplier pool. Sequence links have filled arrows, message links a source circle and
open arrow, and associations are dotted without arrowheads. These are presentation fixtures,
not a validated BPMN process.
The diamond rotates only its outline, leaving labels and port anchors unrotated.
This composition enables core's `detachedGroupsLayer` option so pool/lane backgrounds stay
behind the selectable links. Its lower zoom limit allows Fit view to include both pools.
Symbols, names, graph state and modeling rules belong to the application.
XML import/export, execution and boundary attachment are outside this subset.

{{ NgDocActions.demo("BpmnDemoComponent", { container: false }) }}

```typescript file="./bpmn-demo.component.ts"

```
