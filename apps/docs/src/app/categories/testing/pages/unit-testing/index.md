Test a component that contains a flow with the real `Vflow`. The library ships no mocks: `vflow` renders in every environment of the Angular test runner, so a test exercises the same components as the application.

{% raw %}

```ts
@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" (connect)="connections.push($event)">
    <ng-template vNode let-ctx>
      <div class="step" vSelectable>
        {{ ctx.node.id }}
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
  </vflow>`,
  imports: [Vflow],
})
class EditorComponent {
  readonly nodes = createNodes([
    { id: 'start', point: { x: 0, y: 0 } },
    { id: 'end', point: { x: 250, y: 0 } },
  ]);
  readonly edges: Edge[] = [];
  readonly connections: Connection[] = [];
}

describe('EditorComponent', () => {
  it('renders a node presentation for every node', async () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const steps = fixture.nativeElement.querySelectorAll('.step');

    expect(steps.length).toBe(2);
    expect(steps[0].textContent).toContain('start');
  });
});
```

{% endraw %}

Query the elements of your own presentations, such as `.step` above. The elements the library renders around them are not a public contract.

## Test environments

`ng test` runs in a DOM without layout by default: jsdom, or happy-dom when it is installed. Every element there has a size of zero. With `ng test --browsers=chromiumHeadless` the same specs run in a real browser.

| A test checks                                                                      | jsdom and happy-dom | Browser |
| ---------------------------------------------------------------------------------- | ------------------- | ------- |
| Node, edge and edge label presentations, their context and data                    | Yes                 | Yes     |
| Reaction to changes of `nodes`, `edges` and their signals                          | Yes                 | Yes     |
| Outputs: selection by click, connections by pointer events, `(componentNodeEvent)` | Yes                 | Yes     |
| `setViewport()`, `zoomTo()`, `zoomIn()`, `zoomOut()`, `getNode()`                  | Yes                 | Yes     |
| `initialized`, `fitView()`, `getNodeRect()`, `getNodesBounds()`                    | No                  | Yes     |
| Node sizes, handle positions, `getNodesAtPoint()`, `getIntersectingNodes()`        | No                  | Yes     |

Where layout is missing, the flow reports it instead of failing: `initialized()` stays `false`, `fitView()` resolves to `false`, and an edge path runs between the positions of its nodes. Nothing stays hidden while it waits for a measurement: queries that skip hidden elements, such as `getByRole` of Testing Library, find the content of nodes.

## Interactions

A connection is a pointer press on a source handle that is released on a target handle:

```ts
it('connects two steps', async () => {
  const fixture = TestBed.createComponent(EditorComponent);
  fixture.detectChanges();
  await fixture.whenStable();

  const [start, end] = fixture.nativeElement.querySelectorAll('.step');
  const source = start.querySelector('[handleType="source"]');
  const target = end.querySelector('[handleType="target"]');

  source.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, isPrimary: true }));
  await fixture.whenStable();
  target.dispatchEvent(new PointerEvent('pointerenter'));
  target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
  await fixture.whenStable();

  expect(fixture.componentInstance.connections).toEqual([{ source: 'start', target: 'end', sourceHandleType: 'source', targetHandleType: 'target' }]);
});
```

The flow reacts to the press and to the release in separate change detection passes, as it does for a gesture that spans frames. Let the fixture settle after each of them.

A click on an element with `vSelectable` selects its node. `(nodesChanges)` and `(edgesChanges)` emit one array per tick in a later task, so wait for them, for example with `vi.waitFor()`.

Gestures that depend on coordinates, such as a node drag, belong in a browser run or in an end-to-end test.
