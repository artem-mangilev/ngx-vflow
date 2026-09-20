import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal,
  Type,
  inject,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { createNode } from '../interfaces/node.interface';
import { createEdge } from '../interfaces/edge.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowStatusService } from '../services/flow-status.service';
import { Position } from '../types/position.type';
import { VflowHandleDirective } from './handle.directive';
import { ConnectionControllerDirective } from './connection-controller.directive';
import { DragHandleDirective } from './drag-handle.directive';

const side = signal<Position>('right');

@Component({
  template: `<div style="width: 120px; height: 80px">
    <div style="height: 40px">
      <span vflowHandle handleType="target" position="left" style="display: block; width: 10px; height: 10px"></span>
    </div>
    <span vflowHandle handleType="source" [position]="side()" style="display: block; width: 10px; height: 10px"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHandlesNodeComponent {
  protected readonly side = side;
}

/** Positioned and bordered content, so absolute handle styles resolve against a box other than the node. */
@Component({
  template: `<div style="position: relative; box-sizing: border-box; width: 120px; height: 80px; border: 4px solid">
    <div style="margin-top: 20px; height: 20px">
      <span vflowHandle handleType="source" position="right" style="display: block; width: 10px; height: 10px"></span>
    </div>
    <span
      vflowHandle
      handleType="target"
      position="left"
      layout="manual"
      style="position: absolute; left: 30px; top: 10px; display: block; width: 10px; height: 20px"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PositionedContentNodeComponent {}

@Component({
  template: `<div style="width: 100px; height: 40px">
    <span vflowHandle handleType="target" position="left" style="display: none"></span>
    <span
      vflowHandle
      handleType="source"
      position="right"
      style="visibility: hidden; display: block; width: 0; height: 0"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HiddenHandlesNodeComponent {}

/** The node is the handle; its title is a drag handle. */
@Component({
  template: `<div
    vflowHandle
    handleType="any"
    position="right"
    layout="manual"
    style="display: block; width: 120px; height: 60px">
    <div dragHandle class="title" style="height: 20px">Title</div>
    <div class="body" style="height: 40px"></div>
  </div>`,
  imports: [VflowHandleDirective, DragHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NodeAsHandleComponent {}

/** Binds `connect`, so the connection controller exists and handles can start and validate connections. */
@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" (connect)="(undefined)" />`,
  imports: [VflowComponent, ConnectionControllerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConnectableHostComponent {
  readonly nodes = ['a', 'b'].map((id, i) =>
    createNode({ id, component: NodeAsHandleComponent, point: { x: i * 200, y: 0 } }),
  );
}

@Component({
  selector: 'test-port',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['handleType', 'position', 'handleId', 'canAccept'] }],
  host: { style: 'display: block; width: 8px; height: 8px' },
  template: `{{ handle.handleType() }} {{ handle.state() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PortComponent {
  protected readonly handle = inject(VflowHandleDirective);
}

@Component({
  template: `<div style="width: 100px; height: 40px">
    <test-port handleType="target" position="left" handleId="in" [canAccept]="false" />
  </div>`,
  imports: [PortComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PortNodeComponent {}

describe('VflowHandleDirective', () => {
  function setup(component: Type<unknown>, ids = ['a'], edges: { source: string; target: string }[] = []) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput(
      'nodes',
      ids.map((id, i) => createNode({ id, component, point: { x: i * 200, y: 0 } })),
    );
    fixture.componentRef.setInput(
      'edges',
      edges.map(({ source, target }) => createEdge({ id: `${source}-${target}`, source, target })),
    );
    return fixture;
  }

  async function settle(fixture: ComponentFixture<unknown>) {
    fixture.detectChanges();
    await fixture.whenStable();
    for (let i = 0; i < 6; i++) await new Promise(requestAnimationFrame);
    fixture.detectChanges();
  }

  const nodes = (fixture: ComponentFixture<unknown>) => fixture.debugElement.injector.get(FlowEntitiesService).nodes();
  const handleElement = (fixture: ComponentFixture<unknown>, position: Position) =>
    fixture.nativeElement.querySelector(`.vflow-handle[data-vflow-handle-position="${position}"]`) as HTMLElement;

  function centerInNode(element: HTMLElement) {
    const node = element.closest('.vflow-node')!.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - node.left, y: rect.top + rect.height / 2 - node.top };
  }

  beforeEach(() => side.set('right'));

  it('places an auto handle on the node side at the center of its parent', async () => {
    const fixture = setup(PlainHandlesNodeComponent);
    await settle(fixture);
    const [node] = nodes(fixture);
    const [target, source] = node.handles();

    expect(node.isReady()).toBeTrue();
    expect(centerInNode(handleElement(fixture, 'left'))).toEqual({ x: 0, y: 20 });
    expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 40 });
    expect(target.localPoint()).toEqual({ x: -5, y: 20 });
    expect(source.localPoint()).toEqual({ x: 125, y: 40 });
    expect(handleElement(fixture, 'right').style.right).toBe('0px');
  });

  it('moves the handle when its side changes', async () => {
    const fixture = setup(PlainHandlesNodeComponent);
    await settle(fixture);
    side.set('bottom');
    await settle(fixture);
    const source = nodes(fixture)[0].handles()[1];

    expect(handleElement(fixture, 'bottom')).not.toBeNull();
    expect(centerInNode(handleElement(fixture, 'bottom'))).toEqual({ x: 60, y: 80 });
    expect(source.position()).toBe('bottom');
    expect(source.localPoint()).toEqual({ x: 60, y: 85 });
  });

  it('resolves auto styles against a positioned ancestor and leaves manual handles to the application', async () => {
    const fixture = setup(PositionedContentNodeComponent);
    await settle(fixture);
    const [source, target] = nodes(fixture)[0].handles();
    const right = handleElement(fixture, 'right');
    const left = handleElement(fixture, 'left');

    // Row center: 4px border + 20px margin + 10px half height.
    expect(centerInNode(right)).toEqual({ x: 120, y: 34 });
    expect(source.localPoint()).toEqual({ x: 125, y: 34 });
    expect(left.style.transform).toBe('');
    // Manual: the left side of the element as rendered, inside the 4px border.
    expect(target.localPoint()).toEqual({ x: 34, y: 24 });
  });

  it('shows the node without a display: none handle, hides its edges and measures a visibility: hidden handle', async () => {
    const warn = spyOn(console, 'warn');
    const fixture = setup(HiddenHandlesNodeComponent, ['a', 'b'], [{ source: 'a', target: 'b' }]);
    await settle(fixture);
    const [a, b] = nodes(fixture);
    const edge = fixture.debugElement.injector.get(FlowEntitiesService).edges()[0];

    expect(b.handles()[0].hasBox()).toBeFalse();
    expect(b.handles()[0].isMeasured()).toBeFalse();
    expect(a.handles()[1].isMeasured()).toBeTrue();
    expect(b.isReady()).toBeTrue();
    expect(getComputedStyle(fixture.nativeElement.querySelector('.vflow-node')).visibility).toBe('visible');
    expect(edge.isReady()).toBeFalse();
    expect(getComputedStyle(fixture.nativeElement.querySelector('svg[edge]')).visibility).toBe('hidden');
    expect(warn.calls.allArgs().filter(([message]) => String(message).includes('has no layout box')).length).toBe(2);
  });

  it('exposes state, forwarded role and connectability to a component that applies the directive as a host directive', async () => {
    const fixture = setup(PortNodeComponent);
    await settle(fixture);
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;
    const [handle] = nodes(fixture)[0].handles();

    expect(handle.type()).toBe('target');
    expect(handle.id()).toBe('in');
    expect(port.textContent!.trim()).toBe('target idle');
    expect(port.getAttribute('data-vflow-handle-position')).toBe('left');
    expect(port.getAttribute('data-vflow-handle-can-accept')).toBe('false');
    expect(port.getAttribute('data-vflow-handle-can-start')).toBe('true');
    expect(centerInNode(port)).toEqual({ x: 0, y: 20 });

    handle.state.set('valid');
    await settle(fixture);

    expect(port.textContent!.trim()).toBe('target valid');
    expect(port.getAttribute('data-vflow-handle-state')).toBe('valid');
  });

  it('validates a candidate when the pointer enters a handle element and drags the node only from a drag handle', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(ConnectableHostComponent);
    await settle(fixture);
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    const [a, b] = flow.get(FlowEntitiesService).nodes();
    const status = flow.get(FlowStatusService);
    const elementOf = (node: typeof a) => node.handles()[0].element!;

    // A mousedown on the drag handle drags the node instead of starting a connection.
    const mousedown = () => new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
    elementOf(a).querySelector('.title')!.dispatchEvent(mousedown());
    expect(status.status().state).toBe('node-drag-start');
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, view: window }));
    expect(status.status().state).toBe('node-drag-end');

    elementOf(a).querySelector('.body')!.dispatchEvent(mousedown());
    expect(status.status().state).toBe('connection-start');
    await settle(fixture);
    expect(elementOf(a).dataset['vflowHandleState']).toBe('connecting');

    elementOf(b).dispatchEvent(new MouseEvent('mouseenter'));
    await settle(fixture);
    expect(status.status().state).toBe('connection-validation');
    expect(elementOf(b).dataset['vflowHandleState']).toBe('valid');

    elementOf(b).dispatchEvent(new MouseEvent('mouseleave'));
    await settle(fixture);
    expect(status.status().state).toBe('connection-start');
    expect(elementOf(b).dataset['vflowHandleState']).toBe('idle');

    status.setIdleStatus();
    await settle(fixture);
    expect(elementOf(a).dataset['vflowHandleState']).toBe('idle');
  });

  it('renders a magnet at every measured handle only while a connection is in progress', async () => {
    const fixture = setup(PlainHandlesNodeComponent, ['a', 'b']);
    await settle(fixture);
    const [a] = nodes(fixture);
    const status = fixture.debugElement.injector.get(FlowStatusService);
    const magnets = () => Array.from(fixture.nativeElement.querySelectorAll('.magnet')) as HTMLElement[];

    expect(magnets().length).toBe(0);

    status.setConnectionStartStatus(a, a.handles()[1]);
    await settle(fixture);

    expect(magnets().length).toBe(4);
    const magnet = magnets().find((element) => element.closest('.vflow-node') === a.nodeElement())!;
    expect(parseFloat(magnet.style.left)).toBe(a.handles()[0].localPoint().x);
    expect(parseFloat(magnet.style.top)).toBe(a.handles()[0].localPoint().y);

    status.setIdleStatus();
    await settle(fixture);

    expect(magnets().length).toBe(0);
  });
});
