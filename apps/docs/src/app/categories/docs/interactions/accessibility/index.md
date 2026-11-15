This guide shows how to make a graph usable with a keyboard and a screen reader: naming its nodes and edges,
handling keyboard deletion, translating the labels and styling focus. What the flow renders and announces is listed
in the [Accessibility reference](/docs/reference/accessibility).

The example mirrors as text what a screen reader receives: the name and description of the focused entity, and the
last announcement. Switch its language and move the focus to watch the labels follow. The Later node waits
offscreen: the view pans to it when focus reaches it.

{{ NgDocActions.demoPane("AccessibilityDemoComponent") }}

## Name nodes and edges

The library does not read names out of your templates, and the fallback name is the id. Give every domain node an
`ariaLabel`, and an `ariaDescription` where its state matters:

```typescript
import { createNodes, createEdges } from 'ngx-vflow';

const nodes = createNodes([
  {
    id: 'request',
    point: { x: 20, y: 40 },
    ariaLabel: 'Expense request',
    ariaDescription: 'Requires approval.',
    domAttributes: { 'data-record': 'request', lang: 'en' },
  },
  { id: 'approval', point: { x: 250, y: 40 }, ariaLabel: 'Approval' },
]);
const edges = createEdges([{ id: 'review', source: 'request', target: 'approval', ariaLabel: 'Review route' }]);

nodes[0].ariaDescription!.set('Ready for approval.');
```

To mark the wrapper of a node, an edge or a handle for your CSS or your tests, pass `data-*`, `title`, `lang` or
`dir` in `domAttributes`:

```html
<span vHandle handleType="target" position="left" handleId="incoming" [domAttributes]="{ 'data-port': 'review' }"></span>
```

## Name the graph

Set `flowLabel`, and `flowDescription` if the graph needs one, with `withAccessibility()`:

```typescript
provideVflow(withAccessibility({ flowLabel: 'Approval graph' }));
```

## Label the controls inside nodes

Controls inside your templates keep their own semantics. Give custom buttons, inputs and edge-label controls labels
and keyboard behavior as you would anywhere else, and mark your own decorative SVG `aria-hidden="true"`.

## Apply deletion from the keyboard

`Delete` and `Backspace` on a focused node or edge emit `(deleteRequest)`; the library removes nothing. Apply the
request to your collections:

```html
<vflow [nodes]="nodes" [edges]="edges" (deleteRequest)="onDeleteRequest($event)" />
```

```typescript
onDeleteRequest(request: DeleteRequest) {
  const result = removeElements(request, { nodes: this.nodes, edges: this.edges });
  this.nodes = result.nodes;
  this.edges = result.edges;
}
```

## Translate the labels

Provide a `Partial<AriaLabelConfig>` with `withAccessibility()` inside `provideVflow()`. Put it into the providers
of `bootstrapApplication` for the whole application, or of a route or the component that hosts the flow; a closer
`withAccessibility()` adds its keys to one further up.

```typescript
const labels: Partial<AriaLabelConfig> = {
  flowLabel: 'Граф согласования',
  selected: 'Выбран.',
  parentDescription: (parent) => `Родитель: ${parent}.`,
  edgeLabel: ({ source, target }) => `Связь от ${source} к ${target}`,
};
```

```typescript
@Component({
  providers: [provideVflow(withAccessibility(labels))],
  ...
})
```

If the labels come from a translation service and must follow a change of language, pass a factory that returns
them or a signal of them:

```typescript
provideVflow(withAccessibility(() => inject(TranslocoService).selectTranslateObject('vflow')));
```

## Write your own key instructions

To reword the instruction sentence of a node or an edge, give `nodeInstructions` or `edgeInstructions` a function.
It receives the keys bound at that moment and what the entity can do, so the sentence follows a remap and never
names a command that is unavailable:

```typescript
const labels: Partial<AriaLabelConfig> = {
  nodeInstructions: ({ select, move, delete: remove }, { selectable, movable }) => [selectable && select ? `Нажмите ${select} для выбора.` : '', movable && move ? `Перемещайте выбранный узел: ${move}.` : '', remove ? `Нажмите ${remove} для удаления.` : ''].filter(Boolean).join(' '),
};
```

If a translation wants its own words for the keys, pass a plain string instead; it then stays fixed whatever the
keys are.

## Style the focus indicator

Set `--v-focus`, `--v-focus-halo` and `--v-focus-radius` on the flow element. To give one kind of node its own
shape, set the token per node from a global stylesheet, since the halo is drawn on the wrapper around your template:

```css
[data-v-node][data-shape='pill'] {
  --v-focus-radius: 999px;
}
```

## Take entities out of the Tab order

- To remove all nodes or all edges, set `[nodesFocusable]="false"` or `[edgesFocusable]="false"`.
- To remove one entity, set its `focusable` signal to `false`.
- To keep the view still when focus moves to an offscreen node, set `[autoPanOnNodeFocus]="false"`.

## Keep typing inside a node from running commands

Inputs, textareas, selects, contenteditable regions and buttons already keep their keys. For any other area, such
as a custom editor inside a node, add `vNoKeyboard` to its element.

## Keep every entity reachable with virtualization

Virtualization hides offscreen entities, and Tab skips them. Leave it off where every entity must be reachable by
keyboard.
