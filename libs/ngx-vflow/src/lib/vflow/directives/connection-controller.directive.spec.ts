import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ConnectionControllerDirective } from './connection-controller.directive';
import { ConnectionModel } from '../models/connection.model';
import { EdgeModel } from '../models/edge.model';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { createEdge } from '../interfaces/edge.interface';
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { FlowStatusService } from '../services/flow-status.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { dispatchPointer, pointerEvent } from '../gestures/pointer-events.testing';

describe('ConnectionControllerDirective', () => {
  let flowEntitiesService: FlowEntitiesService;
  let statusService: FlowStatusService;
  let controller: ConnectionControllerDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        NodeRenderingService,
        ViewportService,
        provideZonelessChangeDetection(),
      ],
    });

    flowEntitiesService = TestBed.inject(FlowEntitiesService);
    statusService = TestBed.inject(FlowStatusService);
    controller = TestBed.runInInjectionContext(() => new ConnectionControllerDirective());
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

  it('delays connection and reconnection until the pointer crosses the configured threshold', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    const down = pointerEvent('pointerdown', { x: 100 });
    controller.startConnection(handle, down);
    expect(statusService.status().state).toBe('idle');
    dispatchPointer(document, 'pointermove', { x: 106 });
    expect(statusService.status().state).toBe('idle');
    // Another pointer does not count.
    dispatchPointer(document, 'pointermove', { x: 150, pointerId: 2 });
    expect(statusService.status().state).toBe('idle');
    dispatchPointer(document, 'pointermove', { x: 112 });
    expect(statusService.status().state).toBe('connection-start');
    statusService.setIdleStatus();
    const edge = TestBed.runInInjectionContext(
      () => new EdgeModel(createEdge({ id: 'edge', source: 'source', target: 'target' })),
    );
    controller.startReconnection(handle, edge, down);
    expect(statusService.status().state).toBe('idle');
    dispatchPointer(document, 'pointermove', { x: 112 });
    expect(statusService.status().state).toBe('reconnection-start');
  });

  it('uses the same client-space activation threshold for touch connections', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    controller.startConnection(handle, pointerEvent('pointerdown', { x: 100, pointerType: 'touch' }));
    dispatchPointer(document, 'pointermove', { x: 105, pointerType: 'touch' });
    expect(statusService.status().state).toBe('idle');
    dispatchPointer(document, 'pointermove', { x: 112, pointerType: 'touch' });
    expect(statusService.status().state).toBe('connection-start');
  });

  it('cancels a pending connection on pointer release or window blur', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    for (const cancel of ['pointerup', 'pointercancel', 'blur']) {
      controller.startConnection(handle, pointerEvent('pointerdown', { x: 100 }));
      if (cancel === 'blur') window.dispatchEvent(new Event('blur'));
      else dispatchPointer(document, cancel, { x: 100 });
      dispatchPointer(document, 'pointermove', { x: 150 });
      expect(statusService.status().state).toBe('idle');
    }
  });

  it('should mark the origin handle connecting and keep it while leaving it or resetting other handles', () => {
    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target');

    controller.startConnection(source);
    TestBed.flushEffects();
    expect(source.state()).toBe('connecting');

    // Leaving the origin, or a handle that is not the candidate, changes nothing.
    controller.resetValidateConnection(source);
    controller.resetValidateConnection(target);
    TestBed.flushEffects();
    expect(source.state()).toBe('connecting');
    expect(statusService.status().state).toBe('connection-start');

    controller.validateConnection(target);
    TestBed.flushEffects();
    expect(target.state()).toBe('valid');
    expect(source.state()).toBe('connecting');

    // The origin can be its own candidate; leaving it restores connecting.
    controller.resetValidateConnection(target);
    controller.validateConnection(source);
    TestBed.flushEffects();
    expect(source.state()).toBe('invalid');
    controller.resetValidateConnection(source);
    TestBed.flushEffects();
    expect(source.state()).toBe('connecting');

    statusService.setIdleStatus();
    TestBed.flushEffects();
    expect(source.state()).toBe('idle');
  });

  it('should reject a new connection when its starting handle cannot start', () => {
    const source = createHandle(createNodeModel('source'), 'source', false);
    const connectStart = jasmine.createSpy('connectStart');
    const subscription = controller.connectStart.subscribe(connectStart);

    controller.startConnection(source);

    expect(statusService.status().state).toBe('idle');
    expect(connectStart).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should reject a connection candidate before calling the application validator', () => {
    const validator = jasmine.createSpy('validator').and.returnValue(true);
    flowEntitiesService.connection.set(new ConnectionModel({ validator }));

    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target', true, false);

    controller.startConnection(source);
    controller.validateConnection(target);

    expect(target.state()).toBe('invalid');
    expect(statusService.status().state).toBe('connection-validation');
    expect(validator).not.toHaveBeenCalled();

    controller.endConnection();

    expect(statusService.status().state).toBe('connection-dropped');
    expect(validator).not.toHaveBeenCalled();
  });

  it('should allow reconnection to start from a retained handle without canStart and reject its candidate by canAccept', () => {
    const validator = jasmine.createSpy('validator').and.returnValue(true);
    flowEntitiesService.connection.set(new ConnectionModel({ validator }));

    const retained = createHandle(createNodeModel('source'), 'source', false);
    const candidate = createHandle(createNodeModel('target'), 'target', true, false);
    const oldEdge = TestBed.runInInjectionContext(
      () => new EdgeModel(createEdge({ id: 'old', source: 'source', target: 'target' })),
    );

    controller.startReconnection(retained, oldEdge);

    expect(statusService.status().state).toBe('reconnection-start');

    controller.validateConnection(candidate);
    controller.endConnection();

    expect(candidate.state()).toBe('invalid');
    expect(statusService.status().state).toBe('reconnection-dropped');
    expect(validator).not.toHaveBeenCalled();
  });
});
