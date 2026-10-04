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
  readonly events: ComponentNodeEvent<[TaskNodeComponent]>[] = [];
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

See [Unit testing](../unit-testing) for what a test can check without a browser.
