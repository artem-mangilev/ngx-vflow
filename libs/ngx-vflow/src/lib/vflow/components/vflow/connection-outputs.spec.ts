import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { VflowHandleDirective } from '../../directives/handle.directive';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { Connection } from '../../interfaces/connection.interface';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import {
  ConnectEndEvent,
  ReconnectEndEvent,
  ReconnectEvent,
  ReconnectStartEvent,
} from '../../interfaces/connection-events.interface';
import { dispatchMouse } from '../../gestures/pointer-events.testing';

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
    [view]="[700, 300]"
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

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    fixture.detectChanges();
  }

  async function setup(settings: ConnectionSettings = {}, edges: Edge[] = []) {
    fixture = TestBed.createComponent(ConnectionHostComponent);
    host = fixture.componentInstance;
    host.connection.set(settings);
    host.edges.set(edges);
    await settle();
  }

  function handle(node: string, id: 'in' | 'out') {
    const index = ['a', 'b', 'c'].indexOf(node);
    return fixture.nativeElement.querySelectorAll('.v-node')[index].querySelector(`[vHandle][handleId="${id}"]`);
  }

  /** Presses on `from`, enters `to` and releases on it, as a pointer drag between two handles does. */
  async function connect(from: Element, to: Element) {
    dispatchMouse(from, 'mousedown', { x: 0, y: 0 });
    await settle();
    to.dispatchEvent(new PointerEvent('pointerenter'));
    to.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await settle();
  }

  it('emits the connection between the handles, from source to target whichever end the gesture starts at', async () => {
    await setup();

    await connect(handle('a', 'out'), handle('b', 'in'));
    await connect(handle('c', 'in'), handle('b', 'out'));

    expect(host.connects).toMatchObject([
      { source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' },
      { source: 'b', target: 'c', sourceHandle: 'out', targetHandle: 'in' },
    ]);
    expect(host.connectEnds.map(({ valid, from, to }) => [valid, from.node.id, to.node?.id])).toEqual([
      [true, 'a', 'b'],
      [true, 'c', 'b'],
    ]);
  });

  it('emits no connection that the validator, the handle roles or the self-connection rule reject', async () => {
    const validator = vi.fn((connection: Connection) => connection.target !== 'c');
    await setup({ validator });

    await connect(handle('a', 'out'), handle('c', 'in'));
    await connect(handle('a', 'out'), handle('b', 'out'));
    await connect(handle('a', 'out'), handle('a', 'in'));

    expect(host.connects).toEqual([]);
    expect(host.connectEnds.map(({ valid }) => valid)).toEqual([false, false, false]);
    // Only the connection the built-in rules accept reaches the application validator.
    expect(validator).toHaveBeenCalled();
    for (const [connection] of validator.mock.calls) {
      expect(connection).toEqual({
        source: 'a',
        target: 'c',
        sourceHandle: 'out',
        targetHandle: 'in',
        sourceHandleType: 'source',
        targetHandleType: 'target',
      });
    }
  });

  it('connects a node to itself when self connections are allowed', async () => {
    await setup({ allowSelfConnections: true });

    await connect(handle('a', 'out'), handle('a', 'in'));

    expect(host.connects).toMatchObject([{ source: 'a', target: 'a', sourceHandle: 'out', targetHandle: 'in' }]);
  });

  it('reconnects the target end of an edge to another handle', async () => {
    const [edge] = createEdges([
      { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: 'target' },
    ]);
    await setup({}, [edge]);
    const reconnectHandles = fixture.nativeElement.querySelectorAll('.v-reconnect-handle');
    expect(reconnectHandles.length).toBe(1);

    await connect(reconnectHandles[0], handle('c', 'in'));

    expect(host.reconnectStarts.map(({ edge, node, handle }) => [edge, node.id, handle.id])).toEqual([
      [edge, 'a', 'out'],
    ]);
    expect(host.reconnects).toMatchObject([
      { connection: { source: 'a', target: 'c', sourceHandle: 'out', targetHandle: 'in' }, oldEdge: edge },
    ]);
    expect(host.reconnectEnds.map(({ edge, valid, to }) => [edge, valid, to.node?.id])).toEqual([[edge, true, 'c']]);
    // Reconnection reports the change; the application owns the edge.
    expect(host.connects).toEqual([]);
    expect(edge.target).toBe('b');
  });

  it('offers reconnection only at the ends the edge allows', async () => {
    const edges = createEdges([
      { id: 'both', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: true },
      { id: 'none', source: 'b', target: 'c', sourceHandle: 'out', targetHandle: 'in' },
    ]);
    await setup({}, edges);

    expect(fixture.nativeElement.querySelectorAll('.v-reconnect-handle').length).toBe(2);
  });
});
