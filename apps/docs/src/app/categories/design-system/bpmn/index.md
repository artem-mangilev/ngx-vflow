Two participants: the supplier pool exchanges message flows with the company pool, whose lanes hold
start, task, exclusive and parallel gateway, timer and end elements. Sequence, message and association
flows share one edge template and differ by `vflowBpmnFlow`. Symbols and names are supplied by the consumer.

{{ NgDocActions.demo("BpmnDemoComponent", { container: false }) }}

```typescript file="./bpmn-demo.component.ts"

```

## What this page proves

- `@vflow/ui/bpmn` is a separate entry point; consumers of the shared parts never load it.
- Pools and lanes are `template-group` nodes with a vertical `vflowTitle`; the supplier pool takes part in message flows through its own handles, without a new parenting mechanism.
- Gateways keep text and handle anchors unrotated; external labels sit below events and gateways.
- Message flows use dashed lines with open arrows, associations dotted lines without arrows; markers stay core data.

## Limitations

A visual subset: no BPMN XML import/export, boundary events, subprocess markers, task types or execution.
The message-flow start circle of the BPMN notation is not drawn; core markers offer arrows only.
