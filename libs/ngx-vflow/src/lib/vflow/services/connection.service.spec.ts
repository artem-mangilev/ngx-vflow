import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ConnectionService } from './connection.service';
import { EdgeModel } from '../models/edge.model';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { createEdge } from '../interfaces/edge.interface';
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { NodeRenderingService } from './node-rendering.service';
import { ViewportService } from './viewport.service';
import { FlowRenderingService } from './flow-rendering.service';
import { dispatchPointer, pointerEvent } from '../gestures/pointer-events.testing';
import { Connection } from '../interfaces/connection.interface';
import { ConnectEndEvent, ReconnectEndEvent, ReconnectEvent } from '../interfaces/connection-events.interface';

describe('ConnectionService', () => {
  let flowEntitiesService: FlowEntitiesService;
  let connection: ConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        ConnectionService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });

    flowEntitiesService = TestBed.inject(FlowEntitiesService);
    connection = TestBed.inject(ConnectionService);
  });

  function createNodeModel(id: string) {
    return TestBed.runInInjectionContext(() => new NodeModel(createNode({ id, point: { x: 0, y: 0 } })));
  }

  function createHandle(node: NodeModel, type: 'source' | 'target', canStart = true, canAccept = true) {
    return TestBed.runInInjectionContext(
      () =>
        new HandleModel(
          {
            type: signal(type),
            position: signal(type === 'source' ? 'right' : 'left'),
            element: document.createElement('div'),
            canStart: signal(canStart),
            canAccept: signal(canAccept),
          },
          node,
        ),
    );
  }

  function createEdgeModel(id: string) {
    return TestBed.runInInjectionContext(() => new EdgeModel(createEdge({ id, source: 'source', target: 'target' })));
  }

  function bindValidator() {
    const validator = vi.fn().mockReturnValue(true);
    flowEntitiesService.connectionSettings.bind(signal({ validator }));
    return validator;
  }

  function collect<T>(subject: { subscribe(next: (value: T) => void): unknown }): T[] {
    const values: T[] = [];
    subject.subscribe((value) => values.push(value));
    return values;
  }

  describe('with a drag threshold', () => {
    beforeEach(() => TestBed.inject(FlowSettingsService).bind({ connectionDragThreshold: signal(10) }));

    it('does not start a connection before the pointer crosses the threshold', () => {
      connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
      dispatchPointer(document, 'pointermove', { x: 106 });

      expect(connection.gesture()).toBeNull();
    });

    it('ignores the moves of another pointer', () => {
      connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
      dispatchPointer(document, 'pointermove', { x: 150, pointerId: 2 });

      expect(connection.gesture()).toBeNull();
    });

    it('starts a connection at the move that crosses the threshold', () => {
      connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
      dispatchPointer(document, 'pointermove', { x: 112 });

      expect(connection.gesture()).toMatchObject({ oldEdge: undefined });
      expect(connection.pointer()).toEqual({ x: 112, y: 100 });
    });

    it('starts a reconnection of the edge at the move that crosses the threshold', () => {
      const edge = createEdgeModel('edge');
      const handle = createHandle(createNodeModel('source'), 'source');
      connection.start(handle, pointerEvent('pointerdown', { x: 100 }), edge);
      expect(connection.gesture()).toBeNull();

      dispatchPointer(document, 'pointermove', { x: 112 });

      expect(connection.gesture()?.oldEdge).toBe(edge);
      expect(edge.reconnecting()).toBe(true);
    });

    it('applies the same client-space threshold to touch', () => {
      const handle = createHandle(createNodeModel('source'), 'source');
      connection.start(handle, pointerEvent('pointerdown', { x: 100, pointerType: 'touch' }));
      dispatchPointer(document, 'pointermove', { x: 105, pointerType: 'touch' });
      expect(connection.gesture()).toBeNull();

      dispatchPointer(document, 'pointermove', { x: 112, pointerType: 'touch' });

      expect(connection.gesture()).not.toBeNull();
    });

    it.each([
      ['pointerup', () => dispatchPointer(document, 'pointerup', { x: 100 })],
      ['pointercancel', () => dispatchPointer(document, 'pointercancel', { x: 100 })],
      ['window blur', () => window.dispatchEvent(new Event('blur'))],
    ])('drops a press that has not started a connection on %s', (_, release) => {
      connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));

      release();
      dispatchPointer(document, 'pointermove', { x: 150 });

      expect(connection.gesture()).toBeNull();
    });
  });

  it('follows the pointer once a connection has started', () => {
    connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });

    expect(connection.pointer()).toEqual({ x: 150, y: 100 });
  });

  it('ends a started connection on the release of its pointer', () => {
    connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });

    dispatchPointer(document, 'pointerup', { x: 150 });

    expect(connection.gesture()).toBeNull();
  });

  it('reports a connection released on a candidate as the ids of its ends only', () => {
    const connects = collect<Connection>(connection.connect$);
    connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });
    connection.hover(createHandle(createNodeModel('target'), 'target'));

    dispatchPointer(document, 'pointerup', { x: 150 });

    expect(connects).toEqual([
      { source: 'source', target: 'target', sourceHandle: undefined, targetHandle: undefined },
    ]);
    expect(Object.keys(connects[0])).toEqual(['source', 'target', 'sourceHandle', 'targetHandle']);
  });

  it('reports the end of a connection released on a candidate with both endpoints and the release point', () => {
    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target');
    const ends = collect<ConnectEndEvent>(connection.connectEnd$);
    connection.start(source, pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });
    connection.hover(target);

    dispatchPointer(document, 'pointerup', { x: 150 });

    expect(ends).toEqual([
      {
        valid: true,
        from: { node: source.parentNode.rawNode, handle: { id: undefined, type: 'source', position: 'right' } },
        point: { x: 150, y: 100 },
        to: { node: target.parentNode.rawNode, handle: { id: undefined, type: 'target', position: 'left' } },
      },
    ]);
  });

  it('reports where a connection dropped over the canvas was released, in flow space', () => {
    const pane = document.createElement('div');
    pane.style.cssText = 'position: fixed; left: 10px; top: 20px; width: 400px; height: 300px';
    document.body.append(pane);
    onTestFinished(() => pane.remove());
    TestBed.inject(FlowRenderingService).pane.set(pane);
    TestBed.inject(ViewportService).readableViewport.set({ x: 40, y: 30, zoom: 2 });
    const ends = collect<ConnectEndEvent>(connection.connectEnd$);

    connection.start(createHandle(createNodeModel('source'), 'source'), pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });
    dispatchPointer(document, 'pointerup', { x: 250, y: 150 });

    // The release, not the last move: (250 - 10 - 40) / 2 and (150 - 20 - 30) / 2.
    expect(ends).toMatchObject([{ valid: null, to: null, point: { x: 100, y: 50 } }]);
  });

  describe('handle states', () => {
    let source: HandleModel;
    let target: HandleModel;

    beforeEach(() => {
      source = createHandle(createNodeModel('source'), 'source');
      target = createHandle(createNodeModel('target'), 'target');
    });

    it('marks the origin handle and its node as connecting', () => {
      connection.start(source);

      expect(source.state()).toBe('connecting');
      expect(source.parentNode.connectionActive()).toBe(true);
    });

    it('changes nothing when the pointer leaves the origin or a handle that is not the candidate', () => {
      connection.start(source);

      connection.leave(source);
      connection.leave(target);

      expect(source.state()).toBe('connecting');
      expect(target.state()).toBe('idle');
      expect(connection.gesture()?.candidate).toBeNull();
    });

    it('marks a hovered candidate and its node, and keeps the origin connecting', () => {
      connection.start(source);

      connection.hover(target);

      expect(target.state()).toBe('valid');
      expect(target.parentNode.connectionActive()).toBe(true);
      expect(source.state()).toBe('connecting');
    });

    it('resets a candidate the pointer leaves', () => {
      connection.start(source);
      connection.hover(target);

      connection.leave(target);

      expect(target.state()).toBe('idle');
      expect(target.parentNode.connectionActive()).toBe(false);
    });

    it('never makes the origin its own candidate', () => {
      connection.start(source);

      connection.hover(source);

      expect(source.state()).toBe('connecting');
      expect(connection.gesture()?.candidate).toBeNull();
    });

    it('resets the origin when the connection ends', () => {
      connection.start(source);

      connection.end();

      expect(source.state()).toBe('idle');
      expect(source.parentNode.connectionActive()).toBe(false);
    });
  });

  it('treats a release on the origin handle as a drop, without asking the application validator', () => {
    const validator = bindValidator();
    const source = createHandle(createNodeModel('source'), 'source');
    const ends = collect<ConnectEndEvent>(connection.connectEnd$);
    const connections = collect<Connection>(connection.connect$);

    connection.start(source);
    // The pointer is over the origin, and its magnet, when the gesture begins.
    connection.hover(source);
    connection.end();

    expect(validator).not.toHaveBeenCalled();
    expect(connections).toEqual([]);
    expect(ends).toEqual([expect.objectContaining({ valid: null, to: null })]);
  });

  it('does not start a new connection from a handle that cannot start one', () => {
    const starts = collect(connection.connectStart$);

    connection.start(createHandle(createNodeModel('source'), 'source', false));

    expect(connection.gesture()).toBeNull();
    expect(starts).toEqual([]);
  });

  it('marks a candidate that cannot accept invalid without asking the application validator', () => {
    const validator = bindValidator();
    const target = createHandle(createNodeModel('target'), 'target', true, false);
    connection.start(createHandle(createNodeModel('source'), 'source'));

    connection.hover(target);

    expect(target.state()).toBe('invalid');
    expect(connection.gesture()?.candidate?.valid).toBe(false);
    expect(validator).not.toHaveBeenCalled();
  });

  it('ends a release on a candidate that cannot accept as a drop, without asking the application validator', () => {
    const validator = bindValidator();
    const ends = collect<ConnectEndEvent>(connection.connectEnd$);
    connection.start(createHandle(createNodeModel('source'), 'source'));
    connection.hover(createHandle(createNodeModel('target'), 'target', true, false));

    connection.end();

    expect(connection.gesture()).toBeNull();
    expect(ends.map((end) => end.valid)).toEqual([null]);
    expect(validator).not.toHaveBeenCalled();
  });

  it('starts a reconnection from a retained handle that cannot start a new connection', () => {
    const oldEdge = createEdgeModel('old');

    connection.start(createHandle(createNodeModel('source'), 'source', false), undefined, oldEdge);

    expect(connection.gesture()?.oldEdge).toBe(oldEdge);
  });

  it('rejects a reconnection candidate that cannot accept, and ends the reconnection as a drop', () => {
    const validator = bindValidator();
    const candidate = createHandle(createNodeModel('target'), 'target', true, false);
    const oldEdge = createEdgeModel('old');
    const ends = collect<ReconnectEndEvent>(connection.reconnectEnd$);
    connection.start(createHandle(createNodeModel('source'), 'source', false), undefined, oldEdge);

    connection.hover(candidate);
    expect(candidate.state()).toBe('invalid');
    connection.end();

    expect(candidate.state()).toBe('idle');
    expect(oldEdge.reconnecting()).toBe(false);
    expect(ends.map((end) => end.valid)).toEqual([null]);
    expect(validator).not.toHaveBeenCalled();
  });

  it('hands the application validator both ends with their nodes and handles, in their edge roles', () => {
    const validator = bindValidator();
    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target');

    // Dragged from the target handle: the source handle is still the source of the connection.
    connection.start(target);
    connection.hover(source);

    expect(validator).toHaveBeenCalledExactlyOnceWith({
      source: { node: source.parentNode.rawNode, handle: { id: undefined, type: 'source', position: 'right' } },
      target: { node: target.parentNode.rawNode, handle: { id: undefined, type: 'target', position: 'left' } },
    });
    expect(validator.mock.calls[0][0].source.node).toBe(source.parentNode.rawNode);
  });

  it('asks the application validator about a new connection without a reconnected edge', () => {
    const validator = bindValidator();

    connection.start(createHandle(createNodeModel('source'), 'source'));
    connection.hover(createHandle(createNodeModel('target'), 'target'));

    expect(validator).toHaveBeenCalledOnce();
    expect(validator.mock.calls[0][0]).not.toHaveProperty('reconnectedEdge');
  });

  it('tells the application validator which edge is reconnected, on the hover and on the release', () => {
    const validator = bindValidator();
    const retained = createHandle(createNodeModel('source'), 'source');
    const candidate = createHandle(createNodeModel('other'), 'target');
    const oldEdge = createEdgeModel('old');

    connection.start(retained, undefined, oldEdge);
    connection.hover(candidate);
    connection.end();

    expect(validator.mock.calls.map(([asked]) => asked)).toEqual([
      expect.objectContaining({ reconnectedEdge: oldEdge.edge }),
      expect.objectContaining({ reconnectedEdge: oldEdge.edge }),
    ]);
    expect(validator.mock.calls[1][0].source.node).toBe(retained.parentNode.rawNode);
    expect(validator.mock.calls[1][0].target.node).toBe(candidate.parentNode.rawNode);
  });

  it('keeps the reconnected edge out of the reported connection', () => {
    bindValidator();
    const reconnects = collect<ReconnectEvent>(connection.reconnect$);

    connection.start(createHandle(createNodeModel('source'), 'source'), undefined, createEdgeModel('old'));
    connection.hover(createHandle(createNodeModel('other'), 'target'));
    connection.end();

    expect(reconnects.map((event) => event.connection)).toEqual([{ source: 'source', target: 'other' }]);
  });

  it('validates a release once however many listeners the connection has', () => {
    const validator = bindValidator();
    const first = collect<Connection>(connection.connect$);
    const second = collect<Connection>(connection.connect$);
    connection.start(createHandle(createNodeModel('source'), 'source'));
    connection.hover(createHandle(createNodeModel('target'), 'target'));
    validator.mockClear();

    connection.end();

    expect(validator).toHaveBeenCalledOnce();
    expect(first).toHaveLength(1);
    expect(second).toEqual(first);
  });

  it('completes a reconnection that nobody listens to', () => {
    const oldEdge = createEdgeModel('old');
    connection.start(createHandle(createNodeModel('source'), 'source'), undefined, oldEdge);
    connection.hover(createHandle(createNodeModel('other'), 'target'));

    connection.end();

    expect(connection.gesture()).toBeNull();
    expect(oldEdge.reconnecting()).toBe(false);
  });
});
