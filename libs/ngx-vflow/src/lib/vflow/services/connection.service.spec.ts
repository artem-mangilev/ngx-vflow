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
    return TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id,
            point: { x: 0, y: 0 },
          }),
        ),
    );
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

  it('delays connection and reconnection until the pointer crosses the configured threshold', () => {
    TestBed.inject(FlowSettingsService).bind({ connectionDragThreshold: signal(10) });
    const handle = createHandle(createNodeModel('source'), 'source');
    const down = pointerEvent('pointerdown', { x: 100 });
    connection.start(handle, down);
    expect(connection.gesture()).toBeNull();
    dispatchPointer(document, 'pointermove', { x: 106 });
    expect(connection.gesture()).toBeNull();
    // Another pointer does not count.
    dispatchPointer(document, 'pointermove', { x: 150, pointerId: 2 });
    expect(connection.gesture()).toBeNull();
    dispatchPointer(document, 'pointermove', { x: 112 });
    expect(connection.gesture()?.oldEdge).toBeUndefined();
    expect(connection.pointer()).toEqual({ x: 112, y: 100 });
    connection.end();
    expect(connection.gesture()).toBeNull();
    const edge = createEdgeModel('edge');
    connection.start(handle, down, edge);
    expect(connection.gesture()).toBeNull();
    dispatchPointer(document, 'pointermove', { x: 112 });
    expect(connection.gesture()?.oldEdge).toBe(edge);
    expect(edge.reconnecting()).toBe(true);
  });

  it('uses the same client-space activation threshold for touch connections', () => {
    TestBed.inject(FlowSettingsService).bind({ connectionDragThreshold: signal(10) });
    const handle = createHandle(createNodeModel('source'), 'source');
    connection.start(handle, pointerEvent('pointerdown', { x: 100, pointerType: 'touch' }));
    dispatchPointer(document, 'pointermove', { x: 105, pointerType: 'touch' });
    expect(connection.gesture()).toBeNull();
    dispatchPointer(document, 'pointermove', { x: 112, pointerType: 'touch' });
    expect(connection.gesture()).not.toBeNull();
  });

  it('cancels a pending connection on pointer release or window blur', () => {
    TestBed.inject(FlowSettingsService).bind({ connectionDragThreshold: signal(10) });
    const handle = createHandle(createNodeModel('source'), 'source');
    for (const cancel of ['pointerup', 'pointercancel', 'blur']) {
      connection.start(handle, pointerEvent('pointerdown', { x: 100 }));
      if (cancel === 'blur') window.dispatchEvent(new Event('blur'));
      else dispatchPointer(document, cancel, { x: 100 });
      dispatchPointer(document, 'pointermove', { x: 150 });
      expect(connection.gesture()).toBeNull();
    }
  });

  it('ends a started gesture on the release of its pointer, on the candidate it hovers', () => {
    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target');
    const ends: unknown[] = [];
    connection.connectEnd$.subscribe((end) => ends.push(end));
    const connects: unknown[] = [];
    connection.connect$.subscribe((request) => connects.push(request));

    connection.start(source, pointerEvent('pointerdown', { x: 100 }));
    dispatchPointer(document, 'pointermove', { x: 150 });
    expect(connection.pointer()).toEqual({ x: 150, y: 100 });
    connection.hover(target);
    dispatchPointer(document, 'pointerup', { x: 150 });

    expect(connection.gesture()).toBeNull();
    expect(connects).toEqual([
      {
        source: 'source',
        target: 'target',
        sourceHandle: undefined,
        targetHandle: undefined,
        sourceHandleType: 'source',
        targetHandleType: 'target',
      },
    ]);
    expect(ends).toEqual([
      {
        valid: true,
        from: { node: source.parentNode.rawNode, handle: { id: undefined, type: 'source', position: 'right' } },
        to: { node: target.parentNode.rawNode, handle: { id: undefined, type: 'target', position: 'left' } },
      },
    ]);
  });

  it('should mark the origin handle connecting and keep it while leaving it or resetting other handles', () => {
    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target');

    connection.start(source);
    expect(source.state()).toBe('connecting');
    expect(source.parentNode.connectionActive()).toBe(true);

    // Leaving the origin, or a handle that is not the candidate, changes nothing.
    connection.leave(source);
    connection.leave(target);
    expect(source.state()).toBe('connecting');
    expect(connection.gesture()?.candidate).toBeNull();

    connection.hover(target);
    expect(target.state()).toBe('valid');
    expect(source.state()).toBe('connecting');
    expect(target.parentNode.connectionActive()).toBe(true);

    // The origin can be its own candidate; leaving it restores connecting.
    connection.leave(target);
    expect(target.state()).toBe('idle');
    expect(target.parentNode.connectionActive()).toBe(false);
    connection.hover(source);
    expect(source.state()).toBe('invalid');
    connection.leave(source);
    expect(source.state()).toBe('connecting');

    connection.end();
    expect(source.state()).toBe('idle');
    expect(source.parentNode.connectionActive()).toBe(false);
  });

  it('should reject a new connection when its starting handle cannot start', () => {
    const source = createHandle(createNodeModel('source'), 'source', false);
    const connectStart = vi.fn();
    const subscription = connection.connectStart$.subscribe(connectStart);

    connection.start(source);

    expect(connection.gesture()).toBeNull();
    expect(connectStart).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should reject a connection candidate before calling the application validator', () => {
    const validator = vi.fn().mockReturnValue(true);
    flowEntitiesService.connectionSettings.bind(signal({ validator }));

    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target', true, false);
    const ends: { valid: boolean | null }[] = [];
    connection.connectEnd$.subscribe((end) => ends.push(end));

    connection.start(source);
    connection.hover(target);

    expect(target.state()).toBe('invalid');
    expect(connection.gesture()?.candidate?.valid).toBe(false);
    expect(validator).not.toHaveBeenCalled();

    connection.end();

    expect(connection.gesture()).toBeNull();
    expect(ends.map((end) => end.valid)).toEqual([null]);
    expect(validator).not.toHaveBeenCalled();
  });

  it('should allow reconnection to start from a retained handle without canStart and reject its candidate by canAccept', () => {
    const validator = vi.fn().mockReturnValue(true);
    flowEntitiesService.connectionSettings.bind(signal({ validator }));

    const retained = createHandle(createNodeModel('source'), 'source', false);
    const candidate = createHandle(createNodeModel('target'), 'target', true, false);
    const oldEdge = createEdgeModel('old');
    const ends: { valid: boolean | null }[] = [];
    connection.reconnectEnd$.subscribe((end) => ends.push(end));

    connection.start(retained, undefined, oldEdge);

    expect(connection.gesture()?.oldEdge).toBe(oldEdge);

    connection.hover(candidate);
    expect(candidate.state()).toBe('invalid');

    connection.end();
    expect(candidate.state()).toBe('idle');
    expect(connection.gesture()).toBeNull();
    expect(oldEdge.reconnecting()).toBe(false);
    expect(ends.map((end) => end.valid)).toEqual([null]);
    expect(validator).not.toHaveBeenCalled();
  });
});
