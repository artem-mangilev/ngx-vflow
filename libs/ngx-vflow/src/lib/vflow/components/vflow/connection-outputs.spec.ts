import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from './vflow.component';
import { VflowHandleDirective } from '../../public-directives/handle.directive';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { Connection } from '../../interfaces/connection.interface';
import { ConnectionForValidation, ConnectionSettings } from '../../interfaces/connection-settings.interface';
import {
  ConnectEndEvent,
  ReconnectEndEvent,
  ReconnectEvent,
  ReconnectStartEvent,
} from '../../interfaces/connection-events.interface';
import { dispatchMouse, dispatchPointer } from '../../gestures/pointer-events.testing';

@Component({
  template: `<div style="width: 100px; height: 40px">
    <span
      vHandle
      handleType="target"
      position="left"
      handleId="in"
      style="display: block; width: 10px; height: 10px"></span>
    <span
      vHandle
      handleType="source"
      position="right"
      handleId="out"
      style="display: block; width: 10px; height: 10px"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PortsNodeComponent {}

@Component({
  template: `<vflow
    style="width: 700px; height: 300px"
    [nodes]="nodes"
    [edges]="edges()"
    [connection]="connection()"
    (connect)="connects.push($event)"
    (connectEnd)="connectEnds.push($event)"
    (reconnectStart)="reconnectStarts.push($event)"
    (reconnect)="reconnects.push($event)"
    (reconnectEnd)="reconnectEnds.push($event)" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConnectionHostComponent {
  readonly nodes = createNodes(
    ['a', 'b', 'c'].map((id, i) => ({ id, component: PortsNodeComponent, point: { x: i * 250, y: 0 } })),
  );
  readonly edges = signal<Edge[]>([]);
  readonly connection = signal<ConnectionSettings>({});

  readonly connects: Connection[] = [];
  readonly connectEnds: ConnectEndEvent[] = [];
  readonly reconnectStarts: ReconnectStartEvent[] = [];
  readonly reconnects: ReconnectEvent[] = [];
  readonly reconnectEnds: ReconnectEndEvent[] = [];
}

describe('connection outputs', () => {
  let fixture: ComponentFixture<ConnectionHostComponent>;
  let host: ConnectionHostComponent;

  async function update() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setup(settings: ConnectionSettings = {}, edges: Edge[] = []) {
    fixture = TestBed.createComponent(ConnectionHostComponent);
    host = fixture.componentInstance;
    host.connection.set(settings);
    host.edges.set(edges);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    await update();
  }

  function handle(node: string, id: 'in' | 'out') {
    const index = ['a', 'b', 'c'].indexOf(node);
    return fixture.nativeElement.querySelectorAll('[data-v-node]')[index].querySelector(`[vHandle][handleId="${id}"]`);
  }

  /** Presses on `from`, enters `to` and releases on it, as a pointer drag between two handles does. */
  async function connect(from: Element, to: Element) {
    dispatchMouse(from, 'mousedown', { x: 0, y: 0 });
    await update();
    to.dispatchEvent(new PointerEvent('pointerenter'));
    // The release of the pointer that pressed: the gesture follows it by pointer id.
    to.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await update();
  }

  const sourceOut = { id: 'out', type: 'source', position: 'right' } as const;
  const targetIn = { id: 'in', type: 'target', position: 'left' } as const;

  it.each([
    ['a source', ['a', 'out'], ['b', 'in'], { source: 'a', target: 'b' }],
    ['a target', ['c', 'in'], ['b', 'out'], { source: 'b', target: 'c' }],
  ] as const)(
    'emits the connection from source to target for a gesture that starts at %s',
    async (_, from, to, ends) => {
      await setup();

      await connect(handle(from[0], from[1]), handle(to[0], to[1]));

      expect(host.connects).toEqual([{ ...ends, sourceHandle: 'out', targetHandle: 'in' }]);
    },
  );

  it('emits connectEnd as valid, with the handle the gesture started at and the one it ended at', async () => {
    await setup();

    await connect(handle('c', 'in'), handle('b', 'out'));

    expect(host.connectEnds.map(({ valid, from, to }) => [valid, from.node.id, to?.node.id])).toEqual([
      [true, 'c', 'b'],
    ]);
  });

  describe.each([
    ['the validator', ['a', 'out'], ['c', 'in']],
    ['the handle roles', ['a', 'out'], ['b', 'out']],
    ['the self-connection rule', ['a', 'out'], ['a', 'in']],
  ] as const)('a connection that %s rejects', (_, from, to) => {
    beforeEach(async () => {
      await setup({ validator: ({ target }: ConnectionForValidation) => target.node.id !== 'c' });
      await connect(handle(from[0], from[1]), handle(to[0], to[1]));
    });

    it('is not emitted', () => {
      expect(host.connects).toEqual([]);
    });

    it('ends as invalid', () => {
      expect(host.connectEnds.map(({ valid }) => valid)).toEqual([false]);
    });
  });

  it('hands the validator the application node and the handle of both ends', async () => {
    const validator = vi.fn((connection: ConnectionForValidation) => !!connection);
    await setup({ validator });

    await connect(handle('a', 'out'), handle('c', 'in'));

    const ends = validator.mock.calls.map(([{ source, target }]) => ({ source, target }));
    expect(ends.length).toBeGreaterThan(0);
    expect(ends).toEqual(
      ends.map(() => ({
        source: { node: host.nodes[0], handle: sourceOut },
        target: { node: host.nodes[2], handle: targetIn },
      })),
    );
  });

  it('does not ask the validator about a connection the built-in rules reject', async () => {
    const validator = vi.fn(() => true);
    await setup({ validator });

    await connect(handle('a', 'out'), handle('b', 'out'));
    await connect(handle('a', 'out'), handle('a', 'in'));

    expect(validator).not.toHaveBeenCalled();
  });

  it('connects a node to itself when self connections are allowed', async () => {
    await setup({ allowSelfConnections: true });

    await connect(handle('a', 'out'), handle('a', 'in'));

    expect(host.connects).toEqual([{ source: 'a', target: 'a', sourceHandle: 'out', targetHandle: 'in' }]);
  });

  describe('between handles that an edge already connects', () => {
    const edges = () => createEdges([{ id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }]);

    it('emits no connection and ends as invalid', async () => {
      await setup({}, edges());

      await connect(handle('a', 'out'), handle('b', 'in'));

      expect(host.connects).toEqual([]);
      expect(host.connectEnds.map(({ valid }) => valid)).toEqual([false]);
    });

    it('emits the connection when duplicates are allowed', async () => {
      await setup({ allowDuplicateConnections: true }, edges());

      await connect(handle('a', 'out'), handle('b', 'in'));

      expect(host.connects).toEqual([{ source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }]);
    });
  });

  it('reconnects an edge back to its own handle, which is no duplicate of itself', async () => {
    const [edge] = createEdges([
      { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: 'target' },
    ]);
    await setup({}, [edge]);

    await connect(fixture.nativeElement.querySelector('[data-v-reconnect-handle]'), handle('b', 'in'));

    expect(host.reconnects).toEqual([
      { connection: { source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }, edge },
    ]);
  });

  describe('reconnecting the target end of an edge to another handle', () => {
    let edge: Edge;

    beforeEach(async () => {
      [edge] = createEdges([
        { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: 'target' },
      ]);
      await setup({}, [edge]);
      await connect(fixture.nativeElement.querySelector('[data-v-reconnect-handle]'), handle('c', 'in'));
    });

    it('emits reconnectStart with the edge and the end that stays', () => {
      expect(host.reconnectStarts.map(({ edge, node, handle }) => [edge, node.id, handle.id])).toEqual([
        [edge, 'a', 'out'],
      ]);
    });

    it('emits reconnect with the new connection and the edge', () => {
      expect(host.reconnects).toEqual([
        { connection: { source: 'a', target: 'c', sourceHandle: 'out', targetHandle: 'in' }, edge },
      ]);
    });

    it('emits reconnectEnd as valid, with the handle it ended at', () => {
      expect(host.reconnectEnds.map(({ edge, valid, to }) => [edge, valid, to?.node.id])).toEqual([[edge, true, 'c']]);
    });

    it('leaves the edge to the application and emits no connect', () => {
      expect(edge.target).toBe('b');
      expect(host.connects).toEqual([]);
    });
  });

  describe('the edge whose end is being dragged', () => {
    let edgeHost: SVGElement;

    beforeEach(async () => {
      await setup(
        {},
        createEdges([
          { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: 'target' },
        ]),
      );
      edgeHost = fixture.nativeElement.querySelector('svg[edge]');
      dispatchMouse(fixture.nativeElement.querySelector('[data-v-reconnect-handle]'), 'mousedown', { x: 0, y: 0 });
      await update();
    });

    it('is hidden while the connection line stands in for it', () => {
      expect(getComputedStyle(edgeHost).visibility).toBe('hidden');
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
    });

    it('is shown again after the release', async () => {
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
      await update();

      await expect.poll(() => getComputedStyle(edgeHost).visibility).toBe('visible');
    });
  });

  it.each([
    ['both ends', true, 2],
    ['the target end', 'target' as const, 1],
    ['no end by default', undefined, 0],
  ])('offers reconnection at %s', async (_, reconnectable, count) => {
    await setup(
      {},
      createEdges([{ id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable }]),
    );

    expect(fixture.nativeElement.querySelectorAll('[data-v-reconnect-handle]').length).toBe(count);
  });
});
