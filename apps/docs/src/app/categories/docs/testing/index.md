Test a component that contains a flow with the real `Vflow`. The library ships no mocks: `vflow` renders in every environment of the Angular test runner, so a test exercises the same components as the application.

{% raw %}

```ts
@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" (connect)="connections.push($event)">
    <div *vNode="let ctx" class="step">
      {{ ctx.node.id }}
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
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
| `setViewport()`, `zoomTo()`, `zoomIn()`, `zoomOut()`                               | Yes                 | Yes     |
| `(initialized)`, `fitView()`, `getNodeRect()`, `getNodesBounds()`                  | No                  | Yes     |
| Node sizes, handle positions, `getNodesAtPoint()`, `getIntersectingNodes()`        | No                  | Yes     |

Where layout is missing, the flow reports it instead of failing: `(initialized)` is never emitted, `fitView()` resolves to `false`, and an edge path runs between the positions of its nodes. Nothing stays hidden while it waits for a measurement: queries that skip hidden elements, such as `getByRole` of Testing Library, find the content of nodes.

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
  fixture.detectChanges();
  await fixture.whenStable();
  target.dispatchEvent(new PointerEvent('pointerenter'));
  target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.componentInstance.connections).toEqual([{ source: 'start', target: 'end' }]);
});
```

The flow reacts to the press and to the release in separate change detection passes, as it does for a gesture that spans frames. Let the fixture settle after each of them. In an application with zone.js `whenStable()` does not run change detection, so the examples call `fixture.detectChanges()` first; a zoneless application may leave it out.

A click on the node presentation selects its node. `(nodesChanges)` and `(edgesChanges)` emit one array per tick in a later task, so wait for them, for example with `vi.waitFor()`.

Gestures that depend on coordinates, such as a node drag, belong in a browser run or in an end-to-end test.

## Component nodes

A component node reads its node with `injectNode()` and uses directives such as `vHandle` and `vResizable`, which exist only inside a flow. Render the component in a flow of one node:

{% raw %}

```ts
@Component({
  selector: 'app-task-node',
  template: `<div vResizable>
    {{ ctx.data().title }}
    <button (click)="done.emit(ctx.node.id)">Done</button>
    <span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [Vflow],
})
class TaskNodeComponent {
  readonly done = output<string>();
  protected readonly ctx = injectNode<{ title: string }>();
}

@Component({
  template: `<vflow [nodes]="nodes" (componentNodeEvent)="events.push($event)" />`,
  imports: [Vflow],
})
class HostComponent {
  readonly nodes = createNodes([{ id: 'task', component: TaskNodeComponent, point: { x: 0, y: 0 }, data: { title: 'Review' } }]);
  readonly events: AnyComponentNodeEvent[] = [];
}

describe('TaskNodeComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, node: fixture.nativeElement.querySelector('app-task-node') };
  }

  it('renders the data of its node and follows its changes', async () => {
    const { fixture, node } = await render();

    expect(node.textContent).toContain('Review');

    fixture.componentInstance.nodes[0].data.set({ title: 'Approve' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(node.textContent).toContain('Approve');
  });

  it('reports its outputs through the flow', async () => {
    const { fixture, node } = await render();

    node.querySelector('button').click();

    expect(fixture.componentInstance.events).toEqual([{ nodeId: 'task', eventName: 'done', eventPayload: 'task' }]);
  });
});
```

{% endraw %}

The test needs no providers of the library.

See [Unit testing](#test-environments) for what a test can check without a browser.
