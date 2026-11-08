import { ChangeDetectionStrategy, Component, Provider, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { Node, createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { AnyComponentNodeEvent, isComponentNodeEvent } from '../../interfaces/component-node-event.interface';
import { injectNode } from '../../utils/inject-node';
import { injectEdge } from '../../utils/inject-edge';
import { provideVflow } from '../../features/feature';
import { withEdgeComponents, withNodeComponents } from '../../features/with-entity-components';
import { NodeComponentKey } from '../../interfaces/entity-components.interface';

@Component({
  selector: 'task-node',
  template: `<div class="task">Task {{ ctx.data().title }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskNode {
  readonly ctx = injectNode<{ title: string }>();
  readonly done = output<string>();
}

@Component({
  selector: 'step-node',
  template: `<div class="step">Step</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepNode {}

@Component({
  selector: 'g[linkEdge]',
  template: `<svg:path class="link-path" fill="none" [attr.d]="ctx.path()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LinkEdge {
  readonly ctx = injectEdge();
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    style="width: 500px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    (componentNodeEvent)="events.push($event)">
    <div *vNode class="template-node" style="width: 60px; height: 30px"></div>
  </vflow>`,
})
class HostComponent {
  nodes: Node[] = [];
  edges: Edge[] = [];
  events: AnyComponentNodeEvent[] = [];
}

describe('component registries of vflow', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  function create(rootProviders: Provider[], hostProviders: Provider[], nodes: Node[], edges: Edge[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.nodes = nodes;
    fixture.componentInstance.edges = edges;
    root = fixture.nativeElement;
  }

  async function render(rootProviders: Provider[], hostProviders: Provider[], nodes: Node[], edges: Edge[] = []) {
    create(rootProviders, hostProviders, nodes, edges);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => fixture?.destroy());

  it('renders the node and edge components registered under the keys the entities name', async () => {
    await render(
      provideVflow(withNodeComponents({ task: TaskNode }), withEdgeComponents({ link: LinkEdge })),
      [],
      createNodes([
        { id: 'a', point: { x: 0, y: 0 }, component: 'task', data: { title: 'Draft' } },
        { id: 'b', point: { x: 200, y: 0 }, component: StepNode },
        { id: 'c', point: { x: 0, y: 100 } },
      ]),
      createEdges([{ id: 'ab', source: 'a', target: 'b', component: 'link' }]),
    );

    expect(root.querySelector('.task')?.textContent).toBe('Task Draft');
    expect(root.querySelector('.step')).not.toBeNull();
    expect(root.querySelectorAll('.template-node').length).toBe(1);
    expect(root.querySelector('.link-path')).not.toBeNull();
  });

  it('resolves a key registered with a lazy factory', async () => {
    await render(
      provideVflow(withNodeComponents({ later: () => Promise.resolve(TaskNode) })),
      [],
      createNodes([{ id: 'a', point: { x: 0, y: 0 }, component: 'later', data: { title: 'Later' } }]),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.querySelector('.task')?.textContent).toBe('Task Later');
  });

  it('reports the events of a node rendered by key with the resolved class', async () => {
    await render(
      provideVflow(withNodeComponents({ task: TaskNode })),
      [],
      createNodes([{ id: 'a', point: { x: 0, y: 0 }, component: 'task', data: { title: 'Draft' } }]),
    );
    const task = fixture.debugElement.query(By.directive(TaskNode)).componentInstance as TaskNode;
    task.done.emit('reviewed');

    const [event] = fixture.componentInstance.events;
    expect(event.component).toBe(TaskNode);
    expect(isComponentNodeEvent(event, TaskNode) && event.eventName === 'done' && event.eventPayload).toBe('reviewed');
  });

  it('adds the keys of a host-level registration to those of the root', async () => {
    await render(
      provideVflow(withNodeComponents({ task: TaskNode })),
      provideVflow(withNodeComponents({ step: StepNode })),
      createNodes([
        { id: 'a', point: { x: 0, y: 0 }, component: 'task', data: { title: 'Draft' } },
        { id: 'b', point: { x: 200, y: 0 }, component: 'step' },
      ]),
    );

    expect(root.querySelector('.task')).not.toBeNull();
    expect(root.querySelector('.step')).not.toBeNull();
  });

  it('throws for a key no level registers', () => {
    create(
      provideVflow(withNodeComponents({ task: TaskNode })),
      [],
      createNodes([{ id: 'a', point: { x: 0, y: 0 }, component: 'missing' }]),
    );

    expect(() => fixture.detectChanges()).toThrowError(
      /No node component is registered as "missing"\. Register it with provideVflow\(withNodeComponents\(\{ missing: … \}\)\)/,
    );
  });

  it('types a key as any string until the registry interface is augmented', () => {
    const key: NodeComponentKey = 'anything';
    const node: Node = { id: 'a', point: null as never, component: key };

    expect(node.component).toBe('anything');
  });
});
