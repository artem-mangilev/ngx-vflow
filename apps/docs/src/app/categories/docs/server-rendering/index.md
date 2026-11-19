A flow can be on a page that Angular renders on a server or prerenders in a build. It needs no setup: `vflow` renders there without a window, and starts in the browser.

## What the server renders

The server renders the flow element, your node and edge presentations and the parts you place in the flow. It cannot measure them, so the flow waits for its first layout as it does in a browser: until the application starts, the reader sees the canvas of the flow and nothing on it. Nodes do not appear unmeasured, and the viewport does not jump when `fitView()` runs.

Size the `vflow` element with CSS, as on any page. The canvas then takes its place in the server-rendered page, and nothing moves when the flow appears.

| On the server                           | What happens                         |
| --------------------------------------- | ------------------------------------ |
| `(initialized)`                         | Not emitted                          |
| `fitView()`                             | Resolves to `false`                  |
| Node sizes and handle positions         | Not measured                         |
| An image background                     | Not loaded                           |
| Pointer, wheel and keyboard interaction | Starts with the flow, in the browser |

## The flow starts in the browser

Angular hydration adopts the DOM of the server instead of creating it again. A flow is the exception: it is created anew in the browser, because it moves its own elements between layers and its content waits for a layout anyway. The rest of the page is hydrated as usual.

For the components of your nodes this means two things:

- A node component is created on the server and again in the browser. State it built on the server is not carried over.
- Code that needs a browser belongs in `afterNextRender`, which Angular does not run on a server. A node component that reads `window` or `document` in its constructor fails the server render of the page.

```ts
@Component({
  template: `<canvas #chart></canvas>`,
})
export class ChartNodeComponent {
  private readonly chart = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');

  constructor() {
    afterNextRender(() => drawChart(this.chart().nativeElement.getContext('2d')!));
  }
}
```

## Keep a flow off the server

A `@defer` block renders only its placeholder on a server. Use it for a flow whose nodes cannot run there, or to load the flow and its code later:

```html
@defer (on viewport) {
<app-editor />
} @placeholder {
<div class="editor-placeholder"></div>
}
```

Give the placeholder the size of the flow, so the page keeps its height when the flow replaces it.
