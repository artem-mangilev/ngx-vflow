This guide shows how to style a flow. Nodes, edges, labels and handles are your markup, so most of it is your own
CSS; core adds attributes that carry the state of each element, and tokens for the few parts it draws itself. Both
are listed in [Tokens and attributes](/docs/reference/styling).

## Style a node or an edge by its state

Read the state as a signal in the presentation and bind a class to it:

```html
<div *vNode="let ctx" class="card" [class.card--selected]="ctx.selected()">…</div>
```

If several presentations share one stylesheet, select by the attributes core writes on the host of a node or an
edge instead:

```css
[data-v-selected] .card {
  border-color: royalblue;
}
```

Put such rules into a global stylesheet. The host is an element of the library, so a selector that starts at
`[data-v-selected]` does not match under the emulated view encapsulation of a component.

## Style a handle

A handle is your own element, so its attributes work in component styles:

```css
.port[data-v-handle-state='valid'] {
  background: seagreen;
}
```

## Recolor the parts core draws

Set the core tokens on the `vflow` element or an ancestor:

```css
.editor {
  --v-background: #f8fafc;
  --v-background-pattern: #cbd5e1;
  --v-selection-box: #2563eb;
  --v-focus: #2563eb;
}
```

## Reshape a part core draws

A token changes a color. For size and shape, select the part by its attribute in a global stylesheet:

```css
[data-v-resize-control='handle'] {
  border-radius: 50%;
}
```

## Add a dark theme

Give the tokens their dark values under the selector your application uses for its dark mode, and style your own
presentations the same way:

```css
.dark .editor {
  --v-background: #18181b;
  --v-background-pattern: #3f3f46;
  --v-resize-control-border: #18181b;
  --v-alignment-guides: #fafafa;
}
```

## Keep a detail the same size at every zoom

Divide by the read-only `--v-zoom` token:

```css
.card {
  border-width: calc(1px / var(--v-zoom, 1));
}
```

## Support high contrast

Core switches its own parts to system colors under `forced-colors: active`. Do the same for your presentations
where color alone carries a meaning:

```css
@media (forced-colors: active) {
  .card--selected {
    outline: 2px solid Highlight;
  }
}
```

## Use a ready theme

If you would rather not style everything yourself, [@vflow/ui](/packages/ui/overview) ships node, port and edge
parts with light and dark themes, and one accent color restyles the parts and core together.
