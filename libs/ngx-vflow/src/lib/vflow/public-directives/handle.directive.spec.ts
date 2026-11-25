import { ChangeDetectionStrategy, Component, signal, Type, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { createNode } from '../interfaces/node.interface';
import { createEdge } from '../interfaces/edge.interface';
import { ConnectEndEvent } from '../interfaces/connection-events.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { ConnectionService } from '../services/connection.service';
import { Position } from '../types/position.type';
import { VflowHandleDirective } from './handle.directive';
import { VflowDragHandleDirective } from './drag-handle.directive';
import { dispatchMouse, dispatchPointer } from '../gestures/pointer-events.testing';

const side = signal<Position>('right');
const accept = signal(false);
const canStart = signal(true);

@Component({
  template: `<div style="width: 120px; height: 80px">
    <div style="height: 40px">
      <span vHandle handleType="target" position="left" style="display: block; width: 10px; height: 10px"></span>
    </div>
    <span
      vHandle
      handleType="source"
      [position]="side()"
      [canStart]="canStart()"
      style="display: block; width: 10px; height: 10px"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHandlesNodeComponent {
  protected readonly side = side;
  protected readonly canStart = canStart;
}

/** Positioned and bordered content, so absolute handle styles resolve against a box other than the node. */
@Component({
  template: `<div style="position: relative; box-sizing: border-box; width: 120px; height: 80px; border: 4px solid">
    <div style="margin-top: 20px; height: 20px">
      <span vHandle handleType="source" position="right" style="display: block; width: 10px; height: 10px"></span>
    </div>
    <span
      vHandle
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
    <span vHandle handleType="target" position="left" style="display: none"></span>
    <span
      vHandle
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
    vHandle
    handleType="any"
    position="right"
    layout="manual"
    style="display: block; width: 120px; height: 60px">
    <div vDragHandle class="title" style="height: 20px">Title</div>
    <div class="body" style="height: 40px"></div>
  </div>`,
  imports: [VflowHandleDirective, VflowDragHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NodeAsHandleComponent {}

/** Subscribes to `connectEnd` only. */
@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" (connectEnd)="ends.push($event)" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConnectEndHostComponent {
  readonly nodes = ['a', 'b'].map((id, i) =>
    createNode({ id, component: NodeAsHandleComponent, point: { x: i * 200, y: 0 } }),
  );
  readonly ends: ConnectEndEvent[] = [];
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
    <test-port handleType="target" position="left" handleId="in" [canAccept]="accept()" />
  </div>`,
  imports: [PortComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PortNodeComponent {
  protected readonly accept = accept;
}

/** A list that scrolls inside the node, with an auto and a manual port on its third row. */
@Component({
  template: `<div style="width: 120px">
    <div class="list" style="height: 40px; overflow-y: auto">
      @for (row of [0, 1, 2, 3, 4, 5]; track row) {
        <div style="height: 20px">
          @if (row === 2) {
            <span vHandle handleType="source" position="right" style="display: block; width: 10px; height: 10px"></span>
            <span
              vHandle
              handleType="target"
              position="left"
              layout="manual"
              style="display: block; width: 10px; height: 10px"></span>
          }
        </div>
      }
    </div>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ScrollingListNodeComponent {}

/** A port shifted 5 right and 10 up from its place on the right side. */
@Component({
  template: `<div style="width: 120px; height: 80px">
    <span
      vHandle
      handleType="source"
      position="right"
      [offsetX]="5"
      [offsetY]="-10"
      style="display: block; width: 10px; height: 10px"></span>
    <span vHandle handleType="target" position="left" style="display: block; width: 10px; height: 10px"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OffsetHandleNodeComponent {}

/** The whole node is one connection point whose side follows the other end of each edge. */
@Component({
  template: `<div vHandle handleType="any" position="auto" style="display: block; width: 100px; height: 40px"></div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AutoHandleNodeComponent {}

describe('VflowHandleDirective', () => {
  /** One node per component, 200px apart, ids `a`, `b`, `c`… */
  function setup(components: Type<unknown>[], edges: { source: string; target: string }[] = []) {
    const fixture = TestBed.createComponent(VflowComponent);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.componentRef.setInput(
      'nodes',
      components.map((component, i) =>
        createNode({ id: String.fromCharCode(97 + i), component, point: { x: i * 200, y: 0 } }),
      ),
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

  const nodeElement = (fixture: ComponentFixture<unknown>, id: string) =>
    fixture.nativeElement.querySelector(`[data-v-node="${id}"]`) as HTMLElement;
  const handleIn = (fixture: ComponentFixture<unknown>, node: string, position: Position) =>
    nodeElement(fixture, node).querySelector(`[data-v-handle][data-v-handle-position="${position}"]`) as HTMLElement;
  const handleElement = (fixture: ComponentFixture<unknown>, position: Position) => handleIn(fixture, 'a', position);
  const line = (fixture: ComponentFixture<unknown>) => fixture.nativeElement.querySelector('g[connection] path');
  const magnets = (fixture: ComponentFixture<unknown>) =>
    Array.from(fixture.nativeElement.querySelectorAll('.v-magnet')) as HTMLElement[];

  /** The first and the last point of the path of an edge, in flow units: its source and target points. */
  function edgeEnds(fixture: ComponentFixture<unknown>, id: string) {
    const d = fixture.nativeElement
      .querySelector(`[data-v-edge="${id}"] path[data-v-interactive-edge]`)
      .getAttribute('d') as string;
    const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    return { source: { x: numbers[0], y: numbers[1] }, target: { x: numbers.at(-2)!, y: numbers.at(-1)! } };
  }

  function centerInNode(element: HTMLElement) {
    const node = element.closest('[data-v-node]')!.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - node.left, y: rect.top + rect.height / 2 - node.top };
  }

  /** Presses on a handle element the way a mouse does; the connection starts at the press. */
  async function press(fixture: ComponentFixture<unknown>, element: Element) {
    dispatchMouse(element, 'mousedown', { x: 0, y: 0 });
    await settle(fixture);
  }

  async function enter(fixture: ComponentFixture<unknown>, element: Element) {
    element.dispatchEvent(new PointerEvent('pointerenter'));
    await settle(fixture);
  }

  async function release(fixture: ComponentFixture<unknown>, element: EventTarget = window) {
    dispatchPointer(element, 'pointerup', { x: 0, y: 0 });
    await settle(fixture);
  }

  beforeEach(() => {
    side.set('right');
    accept.set(false);
    canStart.set(true);
  });

  afterEach(() => window.dispatchEvent(new Event('blur')));

  it('places an auto handle on the node side at the center of its parent', async () => {
    const fixture = setup([PlainHandlesNodeComponent]);
    await settle(fixture);

    expect(centerInNode(handleElement(fixture, 'left'))).toEqual({ x: 0, y: 20 });
    expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 40 });
    expect(handleElement(fixture, 'right').style.left).toBe('calc(100% + 0px)');
  });

  it('connects edges at the outer side of an auto handle', async () => {
    const fixture = setup([PlainHandlesNodeComponent, PlainHandlesNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    // Half of the 10px element outside the side: the right handle of a, the left handle of b at x 200.
    expect(edgeEnds(fixture, 'a-b')).toEqual({ source: { x: 125, y: 40 }, target: { x: 195, y: 20 } });
  });

  it('moves the handle and its edges when its side changes', async () => {
    const fixture = setup([PlainHandlesNodeComponent, PlainHandlesNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);
    side.set('bottom');
    await settle(fixture);

    expect(centerInNode(handleElement(fixture, 'bottom'))).toEqual({ x: 60, y: 80 });
    expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 60, y: 85 });
  });

  it('resolves auto styles against a positioned ancestor', async () => {
    const fixture = setup(
      [PositionedContentNodeComponent, PositionedContentNodeComponent],
      [{ source: 'a', target: 'b' }],
    );
    await settle(fixture);

    // Row center: 4px border + 20px margin + 10px half height.
    expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 34 });
    expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 125, y: 34 });
  });

  it('leaves the place of a manual handle to the application and connects at the element as rendered', async () => {
    const fixture = setup(
      [PositionedContentNodeComponent, PositionedContentNodeComponent],
      [{ source: 'a', target: 'b' }],
    );
    await settle(fixture);

    expect(getComputedStyle(handleElement(fixture, 'left')).translate).toBe('none');
    // The left side of the element as rendered, inside the 4px border, in node b at x 200.
    expect(edgeEnds(fixture, 'a-b').target).toEqual({ x: 234, y: 24 });
  });

  it('shifts an auto handle and its connection point by offsetX and offsetY', async () => {
    const fixture = setup([OffsetHandleNodeComponent, OffsetHandleNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 125, y: 30 });
    expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 130, y: 30 });
  });

  it('connects an auto handle on the side of the node that faces the other end', async () => {
    const fixture = setup([AutoHandleNodeComponent, AutoHandleNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    expect(edgeEnds(fixture, 'a-b')).toEqual({ source: { x: 100, y: 20 }, target: { x: 200, y: 20 } });
  });

  it('turns an auto handle to another side when the other end moves', async () => {
    const fixture = setup([AutoHandleNodeComponent, AutoHandleNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    fixture.componentInstance.nodes()[1].point.set({ x: 0, y: 200 });
    await settle(fixture);

    expect(edgeEnds(fixture, 'a-b')).toEqual({ source: { x: 50, y: 40 }, target: { x: 50, y: 200 } });
  });

  describe('in a list that scrolls inside the node', () => {
    /** Edge a-b leaves the auto port of a, edge b-a enters the manual port of a. */
    async function scrolled(scrollTop: number) {
      const fixture = setup(
        [ScrollingListNodeComponent, ScrollingListNodeComponent],
        [
          { source: 'a', target: 'b' },
          { source: 'b', target: 'a' },
        ],
      );
      await settle(fixture);
      nodeElement(fixture, 'a').querySelector('.list')!.scrollTop = scrollTop;
      await settle(fixture);
      return fixture;
    }

    it('keeps the points of a row below the list on its bottom border', async () => {
      const fixture = await scrolled(0);

      // The row, 40 to 60px, is below the 40px list.
      expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 125, y: 40 });
      expect(edgeEnds(fixture, 'b-a').target).toEqual({ x: 0, y: 40 });
      expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 40 });
      expect(handleElement(fixture, 'right').hasAttribute('data-v-handle-clipped')).toBe(true);
      expect(handleElement(fixture, 'left').hasAttribute('data-v-handle-clipped')).toBe(true);
    });

    it('follows the row while it is in view', async () => {
      const fixture = await scrolled(20);

      // The middle of the row, and the middle of the manual element at the top of the row.
      expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 125, y: 30 });
      expect(edgeEnds(fixture, 'b-a').target).toEqual({ x: 0, y: 25 });
      expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 30 });
      expect(handleElement(fixture, 'right').hasAttribute('data-v-handle-clipped')).toBe(false);
      expect(handleElement(fixture, 'left').hasAttribute('data-v-handle-clipped')).toBe(false);
    });

    it('keeps the points of a row above the list on its top border', async () => {
      const fixture = await scrolled(80);

      expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 125, y: 0 });
      expect(edgeEnds(fixture, 'b-a').target).toEqual({ x: 0, y: 0 });
      expect(centerInNode(handleElement(fixture, 'right'))).toEqual({ x: 120, y: 0 });
      expect(handleElement(fixture, 'right').hasAttribute('data-v-handle-clipped')).toBe(true);
    });

    // Out of view, a handle is no snap target: its magnet would wait on the border for connections meant elsewhere.
    it.each([
      { scrollTop: 20, count: 2, row: 'in view' },
      { scrollTop: 80, count: 0, row: 'scrolled out' },
    ])('shows a magnet at a handle only while its row is $row', async ({ scrollTop, count }) => {
      const fixture = setup([ScrollingListNodeComponent]);
      await settle(fixture);
      nodeElement(fixture, 'a').querySelector('.list')!.scrollTop = scrollTop;
      await settle(fixture);

      await press(fixture, handleElement(fixture, 'right'));

      expect(magnets(fixture).length).toBe(count);
      await release(fixture);
    });
  });

  it('shows the node without a display: none handle and hides the edges of that handle', async () => {
    const fixture = setup([HiddenHandlesNodeComponent, HiddenHandlesNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    expect(getComputedStyle(nodeElement(fixture, 'b')).visibility).toBe('visible');
    expect(getComputedStyle(fixture.nativeElement.querySelector('[data-v-edge="a-b"]')).visibility).toBe('hidden');
  });

  it('measures a visibility: hidden handle, so its edges show', async () => {
    const fixture = setup([HiddenHandlesNodeComponent, PlainHandlesNodeComponent], [{ source: 'a', target: 'b' }]);
    await settle(fixture);

    expect(getComputedStyle(fixture.nativeElement.querySelector('[data-v-edge="a-b"]')).visibility).toBe('visible');
    expect(edgeEnds(fixture, 'a-b').source).toEqual({ x: 100, y: 20 });
  });

  it('forwards the inputs of a component that applies the directive as a host directive', async () => {
    const fixture = setup([PortNodeComponent]);
    await settle(fixture);
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    expect(port.textContent!.trim()).toBe('target idle');
    expect(port.getAttribute('data-v-handle-type')).toBe('target');
    expect(port.getAttribute('data-v-handle-position')).toBe('left');
    expect(port.hasAttribute('data-v-handle-can-accept')).toBe(false);
    expect(port.hasAttribute('data-v-handle-can-start')).toBe(true);
    expect(centerInNode(port)).toEqual({ x: 0, y: 20 });
  });

  it('exposes the state to a component that applies the directive as a host directive', async () => {
    accept.set(true);
    const fixture = setup([PlainHandlesNodeComponent, PortNodeComponent]);
    await settle(fixture);
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    await press(fixture, handleElement(fixture, 'right'));
    await enter(fixture, port);

    expect(port.textContent!.trim()).toBe('target valid');
    expect(port.getAttribute('data-v-handle-state')).toBe('valid');
    await release(fixture);
  });

  it('connects to the handle id a host directive forwards', async () => {
    accept.set(true);
    const fixture = setup([PlainHandlesNodeComponent, PortNodeComponent]);
    await settle(fixture);
    const connects: unknown[] = [];
    fixture.componentInstance.connect.subscribe((connection) => connects.push(connection));
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    await press(fixture, handleElement(fixture, 'right'));
    await enter(fixture, port);
    await release(fixture, port);

    expect(connects).toMatchObject([{ source: 'a', target: 'b', targetHandle: 'in' }]);
  });

  it('accepts no connection on a handle with canAccept false', async () => {
    const fixture = setup([PlainHandlesNodeComponent, PortNodeComponent]);
    await settle(fixture);
    const connects: unknown[] = [];
    fixture.componentInstance.connect.subscribe((connection) => connects.push(connection));
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    await press(fixture, handleElement(fixture, 'right'));
    await enter(fixture, port);
    expect(port.getAttribute('data-v-handle-state')).toBe('invalid');
    await release(fixture, port);

    expect(connects).toEqual([]);
  });

  it('starts no connection from a handle with canStart false', async () => {
    canStart.set(false);
    const fixture = setup([PlainHandlesNodeComponent]);
    await settle(fixture);
    const starts: unknown[] = [];
    fixture.componentInstance.connectStart.subscribe((event) => starts.push(event));

    await press(fixture, handleElement(fixture, 'right'));

    expect(handleElement(fixture, 'right').hasAttribute('data-v-handle-can-start')).toBe(false);
    expect(handleElement(fixture, 'right').getAttribute('data-v-handle-state')).toBe('idle');
    expect(line(fixture)).toBeNull();
    expect(starts).toEqual([]);
    await release(fixture);
  });

  describe('a node that is one handle with a drag handle inside', () => {
    async function render() {
      // No connection output is bound: connecting does not depend on a subscription.
      const fixture = setup([NodeAsHandleComponent, NodeAsHandleComponent]);
      await settle(fixture);
      const handleOf = (id: string) => nodeElement(fixture, id).querySelector('[data-v-handle]') as HTMLElement;
      return { fixture, a: handleOf('a'), b: handleOf('b') };
    }

    it('drags the node from the drag handle instead of starting a connection', async () => {
      const { fixture, a } = await render();

      dispatchMouse(a.querySelector('.title')!, 'mousedown', { x: 0, y: 0 });
      // The drag starts once the pointer passes the node drag threshold.
      dispatchMouse(window, 'mousemove', { x: 10, y: 0 });
      dispatchMouse(window, 'mouseup', { x: 10, y: 0 });
      await settle(fixture);

      expect(fixture.componentInstance.getNodeRect('a')!.x).toBe(10);
      expect(line(fixture)).toBeNull();
      expect(a.dataset['vHandleState']).toBe('idle');
    });

    it('starts a connection from the rest of the element', async () => {
      const { fixture, a } = await render();

      await press(fixture, a.querySelector('.body')!);

      expect(a.dataset['vHandleState']).toBe('connecting');
      expect(line(fixture)).not.toBeNull();
      await release(fixture);
    });

    it('marks the handle the pointer enters as a valid candidate', async () => {
      const { fixture, a, b } = await render();

      await press(fixture, a.querySelector('.body')!);
      await enter(fixture, b);

      expect(b.dataset['vHandleState']).toBe('valid');
      await release(fixture);
    });

    it('returns the handle the pointer leaves to idle', async () => {
      const { fixture, a, b } = await render();

      await press(fixture, a.querySelector('.body')!);
      await enter(fixture, b);
      b.dispatchEvent(new PointerEvent('pointerleave'));
      await settle(fixture);

      expect(b.dataset['vHandleState']).toBe('idle');
      await release(fixture);
    });

    it('ends the connection on a release over the candidate', async () => {
      const { fixture, a, b } = await render();

      await press(fixture, a.querySelector('.body')!);
      await enter(fixture, b);
      await release(fixture, b);

      expect(a.dataset['vHandleState']).toBe('idle');
      expect(b.dataset['vHandleState']).toBe('idle');
      expect(line(fixture)).toBeNull();
    });
  });

  // Moves to connection-outputs.spec.ts with the work on the flow specs.
  it('emits connectEnd to a flow that subscribes to no other connection output', async () => {
    const fixture = TestBed.createComponent(ConnectEndHostComponent);
    await settle(fixture);
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    const [a, b] = flow.get(FlowEntitiesService).nodes();
    const elementOf = (node: typeof a) => node.handles()[0].element!;

    dispatchMouse(elementOf(a).querySelector('.body')!, 'mousedown', { x: 0, y: 0 });
    await settle(fixture);
    elementOf(b).dispatchEvent(new PointerEvent('pointerenter'));
    elementOf(b).dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await settle(fixture);

    expect(fixture.componentInstance.ends.length).toBe(1);
    const [end] = fixture.componentInstance.ends;
    expect(end.valid).toBe(true);
    expect(end.from.node.id).toBe('a');
    expect(end.to?.node.id).toBe('b');
    expect(flow.get(ConnectionService).gesture()).toBeNull();
  });

  describe('magnets', () => {
    it('renders a magnet at every measured handle only while a connection is in progress', async () => {
      const fixture = setup([PlainHandlesNodeComponent, PlainHandlesNodeComponent]);
      await settle(fixture);
      expect(magnets(fixture).length).toBe(0);

      await press(fixture, handleElement(fixture, 'right'));
      expect(magnets(fixture).length).toBe(4);

      await release(fixture);
      expect(magnets(fixture).length).toBe(0);
    });

    it('places a magnet on the connection point of its handle', async () => {
      const fixture = setup([PlainHandlesNodeComponent, PlainHandlesNodeComponent]);
      await settle(fixture);

      await press(fixture, handleElement(fixture, 'right'));
      const points = magnets(fixture)
        .filter((magnet) => nodeElement(fixture, 'a').contains(magnet))
        .map((magnet) => [parseFloat(magnet.style.left), parseFloat(magnet.style.top)]);

      expect(points).toEqual(
        expect.arrayContaining([
          [-5, 20],
          [125, 40],
        ]),
      );
      await release(fixture);
    });
  });
});
