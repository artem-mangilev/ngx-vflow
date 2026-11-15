The size of a flow is CSS: `vflow` is a block element, and the graph fills it. Give the element, or its parent, a width and a height the way you size any element of the page; there is no size input.

## Filling the parent

By default `vflow` fills its parent element, so the parent needs a width and a height of its own:

```css
.editor {
  width: 100vw;
  height: 100vh;
}
```

{{ NgDocActions.demo("ViewSizeAutoDemoComponent", { fullscreenRoute: "view-size-auto" }) }}

## Fixed size

Size the element itself for a flow of fixed size:

```html
<vflow [nodes]="nodes" [edges]="edges" style="width: 600px; height: 600px" />
```

{{ NgDocActions.demo("ViewSizeFixedDemoComponent", { fullscreenRoute: "view-size-fixed" }) }}

The flow measures its element and follows every change of its size, from a window resize to a collapsing side panel, so the minimap, auto-pan and `fitView()` always work with the current size.
