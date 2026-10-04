import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentNodeEvent, Vflow, createNodes, injectNode } from 'ngx-vflow';

// The example of the "Unit testing component nodes" docs page.
@Component({
  selector: 'app-task-node',
  template: `<div vResizable>
    {{ ctx.data().title }}
    <button (click)="done.emit(ctx.node.id)">Done</button>
    <span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskNodeComponent {
  readonly done = output<string>();
  protected readonly ctx = injectNode<{ title: string }>();
}

@Component({
  template: `<vflow [nodes]="nodes" (componentNodeEvent)="events.push($event)" />`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly nodes = createNodes([
    { id: 'task', component: TaskNodeComponent, point: { x: 0, y: 0 }, data: { title: 'Review' } },
  ]);
  readonly events: ComponentNodeEvent<[TaskNodeComponent]>[] = [];
}

describe('a component node in a flow of one node', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, node: (fixture.nativeElement as HTMLElement).querySelector('app-task-node')! };
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

    node.querySelector('button')!.click();

    expect(fixture.componentInstance.events).toEqual([{ nodeId: 'task', eventName: 'done', eventPayload: 'task' }]);
  });
});
